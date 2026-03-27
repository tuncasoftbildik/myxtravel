"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { useAdmin, hasPermission } from "@/lib/supabase/use-admin";

const LazyCharts = dynamic(() => import("./charts"), { ssr: false });

interface Agency {
  id: string;
  name: string;
  slug: string;
  commission_rate: number;
}

interface Order {
  id: string;
  agency_id: string;
  order_type: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  base_price: number;
  commission_rate: number;
  commission_amount: number;
  platform_commission_rate: number;
  platform_commission_amount: number;
  agency_markup_rate: number;
  agency_markup_amount: number;
  total_price: number;
  status: string;
  created_at: string;
  agencies?: { name: string; slug: string };
}

interface Summary {
  total_orders: number;
  total_base: number;
  total_commission: number;
  total_revenue: number;
  total_platform_commission: number;
  total_agency_markup: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  flight: "Ucak",
  hotel: "Otel",
  bus: "Otobus",
  car: "Arac Kiralama",
  transfer: "Transfer",
  tour: "Tur",
};

const TYPE_COLORS: Record<string, string> = {
  flight: "#C41E3A",
  hotel: "#2563eb",
  bus: "#d97706",
  car: "#7c3aed",
  transfer: "#059669",
  tour: "#db2777",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-600" },
  confirmed: { label: "Onayli", color: "bg-blue-50 text-blue-600" },
  completed: { label: "Tamamlandi", color: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Iptal", color: "bg-red-50 text-red-500" },
  refunded: { label: "Iade", color: "bg-purple-50 text-purple-600" },
};

type DateMode = "month" | "range";

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }),
    });
  }
  return months;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR");
}

function formatMoney(n: number) {
  return Number(n).toLocaleString("tr-TR");
}

// ── Export helpers ──
function downloadCSV(orders: Order[], agencies: Agency[]) {
  const agencyMap = new Map(agencies.map((a) => [a.id, a.name]));
  const header = [
    "Tarih", "Acenta", "Tur", "Urun", "Musteri", "Email",
    "API Fiyat", "Platform Komisyon", "Acenta Kari", "Satis Fiyati", "Durum",
  ];
  const rows = orders.map((o) => [
    formatDate(o.created_at),
    o.agencies?.name || agencyMap.get(o.agency_id) || "",
    ORDER_TYPE_LABELS[o.order_type] || o.order_type,
    `"${(o.product_name || "").replace(/"/g, '""')}"`,
    `"${(o.customer_name || "").replace(/"/g, '""')}"`,
    o.customer_email || "",
    Number(o.base_price).toFixed(2),
    Number(o.platform_commission_amount || o.commission_amount).toFixed(2),
    Number(o.agency_markup_amount || 0).toFixed(2),
    Number(o.total_price).toFixed(2),
    STATUS_LABELS[o.status]?.label || o.status,
  ]);
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rapor-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(orders: Order[], summary: Summary | null, agencies: Agency[]) {
  const agencyMap = new Map(agencies.map((a) => [a.id, a.name]));
  const w = window.open("", "_blank");
  if (!w) return;

  const tableRows = orders.map((o) => `
    <tr>
      <td>${formatDate(o.created_at)}</td>
      <td>${o.agencies?.name || agencyMap.get(o.agency_id) || ""}</td>
      <td>${ORDER_TYPE_LABELS[o.order_type] || o.order_type}</td>
      <td>${o.product_name || ""}</td>
      <td>${o.customer_name || ""}</td>
      <td style="text-align:right">${formatMoney(Number(o.base_price))} TL</td>
      <td style="text-align:right">${formatMoney(Number(o.platform_commission_amount || o.commission_amount))} TL</td>
      <td style="text-align:right">${formatMoney(Number(o.agency_markup_amount || 0))} TL</td>
      <td style="text-align:right;font-weight:bold">${formatMoney(Number(o.total_price))} TL</td>
      <td>${STATUS_LABELS[o.status]?.label || o.status}</td>
    </tr>
  `).join("");

  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Satis Raporu</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:24px;font-size:11px;color:#333}
      h1{font-size:18px;margin-bottom:4px} .sub{color:#888;margin-bottom:16px}
      .cards{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}
      .card{background:#f9f9f9;padding:10px 16px;border-radius:8px}
      .card .val{font-size:18px;font-weight:bold}
      .card .lbl{font-size:10px;color:#888;text-transform:uppercase}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{padding:6px 8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap}
      th{background:#f5f5f5;font-size:10px;text-transform:uppercase;color:#666}
      @media print{body{padding:0}.no-print{display:none}}
    </style></head><body>
    <h1>Satis Raporu</h1>
    <p class="sub">${new Date().toLocaleDateString("tr-TR")} tarihinde olusturuldu</p>
    ${summary ? `<div class="cards">
      <div class="card"><div class="lbl">Siparis</div><div class="val">${summary.total_orders}</div></div>
      <div class="card"><div class="lbl">API Toplam</div><div class="val">${formatMoney(summary.total_base)} TL</div></div>
      <div class="card"><div class="lbl">Platform Komisyon</div><div class="val">${formatMoney(summary.total_platform_commission)} TL</div></div>
      <div class="card"><div class="lbl">Acenta Kari</div><div class="val">${formatMoney(summary.total_agency_markup)} TL</div></div>
      <div class="card"><div class="lbl">Musteri Toplam</div><div class="val">${formatMoney(summary.total_revenue)} TL</div></div>
    </div>` : ""}
    <table>
      <thead><tr><th>Tarih</th><th>Acenta</th><th>Tur</th><th>Urun</th><th>Musteri</th><th style="text-align:right">API Fiyat</th><th style="text-align:right">Platform</th><th style="text-align:right">Acenta Kari</th><th style="text-align:right">Satis</th><th>Durum</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <script>setTimeout(()=>window.print(),300)</script>
  </body></html>`);
  w.document.close();
}

// ── Data helpers ──
interface TypeBreakdown {
  type: string;
  label: string;
  count: number;
  base: number;
  platform: number;
  markup: number;
  revenue: number;
}

function getTypeBreakdown(orders: Order[]): TypeBreakdown[] {
  const map = new Map<string, TypeBreakdown>();
  for (const o of orders) {
    const t = o.order_type;
    const cur = map.get(t) || { type: t, label: ORDER_TYPE_LABELS[t] || t, count: 0, base: 0, platform: 0, markup: 0, revenue: 0 };
    cur.count++;
    cur.base += Number(o.base_price);
    cur.platform += Number(o.platform_commission_amount || o.commission_amount);
    cur.markup += Number(o.agency_markup_amount || 0);
    cur.revenue += Number(o.total_price);
    map.set(t, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

interface DailyData {
  date: string;
  revenue: number;
  platform: number;
  markup: number;
  orders: number;
}

function getDailyData(orders: Order[]): DailyData[] {
  const map = new Map<string, DailyData>();
  for (const o of orders) {
    const d = new Date(o.created_at).toLocaleDateString("tr-TR");
    const cur = map.get(d) || { date: d, revenue: 0, platform: 0, markup: 0, orders: 0 };
    cur.revenue += Number(o.total_price);
    cur.platform += Number(o.platform_commission_amount || o.commission_amount);
    cur.markup += Number(o.agency_markup_amount || 0);
    cur.orders++;
    map.set(d, cur);
  }
  return Array.from(map.values());
}

// ── Agency comparison ──
interface AgencyComparison {
  name: string;
  orders: number;
  revenue: number;
  platform: number;
  markup: number;
  base: number;
}

function getAgencyComparison(orders: Order[]): AgencyComparison[] {
  const map = new Map<string, AgencyComparison>();
  for (const o of orders) {
    const name = o.agencies?.name || o.agency_id;
    const cur = map.get(name) || { name, orders: 0, revenue: 0, platform: 0, markup: 0, base: 0 };
    cur.orders++;
    cur.revenue += Number(o.total_price);
    cur.platform += Number(o.platform_commission_amount || o.commission_amount);
    cur.markup += Number(o.agency_markup_amount || 0);
    cur.base += Number(o.base_price);
    map.set(name, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

// ── Main page ──
export default function AdminRaporlarPage() {
  return (
    <Suspense fallback={<><Header variant="solid" /><main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center"><div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" /></main></>}>
      <AdminRaporlar />
    </Suspense>
  );
}

function AdminRaporlar() {
  const searchParams = useSearchParams();
  const presetAgency = searchParams.get("agency") || "";

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedAgency, setSelectedAgency] = useState(presetAgency);
  const [selectedMonth, setSelectedMonth] = useState(getMonthOptions()[0].value);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const { isAdmin, isLoggedIn, loading: authLoading, permissions } = useAdmin();

  // Date range state
  const [dateMode, setDateMode] = useState<DateMode>("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareAgencies, setCompareAgencies] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/agencies?all=true")
      .then((r) => r.json())
      .then((data) => { if (data.agencies) setAgencies(data.agencies); })
      .catch(() => {});
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (compareMode && compareAgencies.length > 0) {
        params.set("agency_ids", compareAgencies.join(","));
      } else if (selectedAgency) {
        params.set("agency_id", selectedAgency);
      }

      if (dateMode === "month" && selectedMonth) {
        params.set("month", selectedMonth);
      } else if (dateMode === "range") {
        if (dateFrom) params.set("date_from", dateFrom);
        if (dateTo) params.set("date_to", dateTo);
      }

      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/agency/orders?${params}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.summary) setSummary(data.summary);
    } catch {}
    setLoading(false);
  }, [selectedAgency, selectedMonth, selectedStatus, dateMode, dateFrom, dateTo, compareMode, compareAgencies]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const dailyData = useMemo(() => getDailyData(orders), [orders]);
  const typeBreakdown = useMemo(() => getTypeBreakdown(orders), [orders]);
  const agencyComparison = useMemo(() => getAgencyComparison(orders), [orders]);

  // Compare checkbox toggle
  function toggleCompareAgency(id: string) {
    setCompareAgencies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  if (authLoading) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">
              {!isLoggedIn ? "Bu sayfayi goruntulemek icin giris yapmalisiniz." : "Bu sayfaya erisim yetkiniz bulunmamaktadir."}
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!hasPermission(permissions, "raporlar")) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">Bu modüle erişim yetkiniz bulunmamaktadır.</p>
            <a href="/admin" className="text-brand-red font-semibold hover:underline">Admin Paneli</a>
          </div>
        </main>
      </>
    );
  }

  const selectClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none";
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none";

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Satis Raporlari</h1>
              <p className="text-sm text-gray-500 mt-1">Acenta bazli satis ve komisyon takibi</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => downloadCSV(orders, agencies)}
                disabled={orders.length === 0}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Excel (CSV)
              </button>
              <button
                onClick={() => downloadPDF(orders, summary, agencies)}
                disabled={orders.length === 0}
                className="px-4 py-2 text-sm font-medium bg-brand-red text-white rounded-lg hover:bg-brand-red/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                PDF Yazdir
              </button>
              <Link href="/admin/acentalar" className="text-sm text-brand-red hover:underline">Acentalar &rarr;</Link>
              <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Agency filter / Compare toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">Acenta</label>
                  <button
                    onClick={() => { setCompareMode(!compareMode); setCompareAgencies([]); }}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${compareMode ? "bg-brand-red text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {compareMode ? "Karsilastirma ACIK" : "Karsilastir"}
                  </button>
                </div>
                {compareMode ? (
                  <div className="border border-gray-200 rounded-lg p-2 max-h-[120px] overflow-y-auto space-y-1">
                    {agencies.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-1 rounded">
                        <input
                          type="checkbox"
                          checked={compareAgencies.includes(a.id)}
                          onChange={() => toggleCompareAgency(a.id)}
                          className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="truncate">{a.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <select value={selectedAgency} onChange={(e) => setSelectedAgency(e.target.value)} className={selectClass}>
                    <option value="">Tum Acentalar</option>
                    {agencies.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} (%{a.commission_rate})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date mode / filters */}
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-medium text-gray-600">Donem</label>
                  <div className="flex bg-gray-100 rounded-md p-0.5">
                    <button
                      onClick={() => setDateMode("month")}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${dateMode === "month" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                    >
                      Ay
                    </button>
                    <button
                      onClick={() => setDateMode("range")}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${dateMode === "range" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                    >
                      Tarih Araligi
                    </button>
                  </div>
                </div>
                {dateMode === "month" ? (
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={selectClass}>
                    {getMonthOptions().map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className={inputClass}
                      placeholder="Baslangic"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className={inputClass}
                      placeholder="Bitis"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durum</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className={selectClass}>
                  <option value="">Tumu</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Siparis</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_orders}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">API Toplam</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(summary.total_base)} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Platform Komisyon</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{formatMoney(summary.total_platform_commission)} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Acenta Kari</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{formatMoney(summary.total_agency_markup)} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Toplam Komisyon</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{formatMoney(summary.total_commission)} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Musteri Toplam</p>
                <p className="text-2xl font-bold text-brand-red mt-1">{formatMoney(summary.total_revenue)} TL</p>
              </div>
            </div>
          )}

          {/* Charts */}
          {!loading && orders.length > 0 && (
            <LazyCharts
              dailyData={dailyData}
              typeBreakdown={typeBreakdown}
              typeColors={TYPE_COLORS}
              orderTypeLabels={ORDER_TYPE_LABELS}
            />
          )}

          {/* Agency comparison */}
          {compareMode && agencyComparison.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Acenta Karsilastirma</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2">Acenta</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">Siparis</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">API Toplam</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">Platform</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">Acenta Kari</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">Musteri Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencyComparison.map((a) => (
                      <tr key={a.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{a.orders}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right font-mono">{formatMoney(a.base)} TL</td>
                        <td className="px-4 py-3 text-sm text-emerald-600 text-right font-mono">{formatMoney(a.platform)} TL</td>
                        <td className="px-4 py-3 text-sm text-blue-600 text-right font-mono">{formatMoney(a.markup)} TL</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right font-mono">{formatMoney(a.revenue)} TL</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed type breakdown */}
          {!loading && typeBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Hizmet Turune Gore Detay</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2">Hizmet</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">Adet</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">API Toplam</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">Platform</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">Acenta Kari</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2">Musteri Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeBreakdown.map((t) => (
                      <tr key={t.type} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[t.type] || "#6b7280" }} />
                            <span className="text-sm font-medium text-gray-900">{t.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{t.count}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right font-mono">{formatMoney(t.base)} TL</td>
                        <td className="px-4 py-3 text-sm text-emerald-600 text-right font-mono">{formatMoney(t.platform)} TL</td>
                        <td className="px-4 py-3 text-sm text-blue-600 text-right font-mono">{formatMoney(t.markup)} TL</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right font-mono">{formatMoney(t.revenue)} TL</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders table */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-gray-400">Bu donemde siparis bulunamadi.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tarih</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Acenta</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tur</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Urun</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Musteri</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Email</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">API Fiyat</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Platform</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Acenta Kari</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Satis Fiyati</th>
                      <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const st = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-500" };
                      return (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-900">
                            {order.agencies?.name || "\u2014"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium text-gray-600">
                              {ORDER_TYPE_LABELS[order.order_type] || order.order_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{order.product_name}</td>
                          <td className="px-4 py-3 text-xs text-gray-700">{order.customer_name || "\u2014"}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{order.customer_email || "\u2014"}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 text-right font-mono">{formatMoney(Number(order.base_price))} TL</td>
                          <td className="px-4 py-3 text-xs text-emerald-600 text-right font-mono">
                            +{formatMoney(Number(order.platform_commission_amount || order.commission_amount))} TL
                            <span className="text-gray-400 ml-1">(%{order.platform_commission_rate || order.commission_rate})</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-blue-600 text-right font-mono">
                            +{formatMoney(Number(order.agency_markup_amount || 0))} TL
                            <span className="text-gray-400 ml-1">(%{order.agency_markup_rate || 0})</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-900 text-right font-mono">{formatMoney(Number(order.total_price))} TL</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
