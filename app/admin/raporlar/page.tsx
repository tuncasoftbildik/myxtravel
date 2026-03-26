"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { useAdmin } from "@/lib/supabase/use-admin";

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
  flight: "Uçak",
  hotel: "Otel",
  bus: "Otobüs",
  car: "Araç Kiralama",
  transfer: "Transfer",
  tour: "Tur",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-600" },
  confirmed: { label: "Onaylı", color: "bg-blue-50 text-blue-600" },
  completed: { label: "Tamamlandı", color: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "İptal", color: "bg-red-50 text-red-500" },
  refunded: { label: "İade", color: "bg-purple-50 text-purple-600" },
};

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
  const { isAdmin, isLoggedIn, loading: authLoading } = useAdmin();

  useEffect(() => {
    fetch("/api/agencies?all=true")
      .then((r) => r.json())
      .then((data) => { if (data.agencies) setAgencies(data.agencies); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [selectedAgency, selectedMonth, selectedStatus]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedAgency) params.set("agency_id", selectedAgency);
      if (selectedMonth) params.set("month", selectedMonth);
      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/agency/orders?${params}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.summary) setSummary(data.summary);
    } catch {}
    setLoading(false);
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
              {!isLoggedIn ? "Bu sayfayı görüntülemek için giriş yapmalısınız." : "Bu sayfaya erişim yetkiniz bulunmamaktadır."}
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Satış Raporları</h1>
              <p className="text-sm text-gray-500 mt-1">Acenta bazlı satış ve komisyon takibi</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/acentalar" className="text-sm text-brand-red hover:underline">Acentalar &rarr;</Link>
              <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Acenta</label>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                >
                  <option value="">Tüm Acentalar</option>
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} (%{a.commission_rate})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dönem</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                >
                  {getMonthOptions().map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durum</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                >
                  <option value="">Tümü</option>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_base.toLocaleString("tr-TR")} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Platform Komisyon</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.total_platform_commission.toLocaleString("tr-TR")} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Acenta Kari</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{summary.total_agency_markup.toLocaleString("tr-TR")} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Toplam Komisyon</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{summary.total_commission.toLocaleString("tr-TR")} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Musteri Toplam</p>
                <p className="text-2xl font-bold text-brand-red mt-1">{summary.total_revenue.toLocaleString("tr-TR")} TL</p>
              </div>
            </div>
          )}

          {/* Type breakdown */}
          {summary && Object.keys(summary.by_type).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Hizmet Türüne Göre</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(summary.by_type).map(([type, count]) => (
                  <div key={type} className="px-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{ORDER_TYPE_LABELS[type] || type}</span>
                    <span className="text-sm text-gray-400 ml-2">{count} adet</span>
                  </div>
                ))}
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
              <p className="text-gray-400">Bu dönemde sipariş bulunamadı.</p>
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
                            {new Date(order.created_at).toLocaleDateString("tr-TR")}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-900">
                            {order.agencies?.name || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium text-gray-600">
                              {ORDER_TYPE_LABELS[order.order_type] || order.order_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{order.product_name}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 text-right font-mono">{Number(order.base_price).toLocaleString("tr-TR")} TL</td>
                          <td className="px-4 py-3 text-xs text-emerald-600 text-right font-mono">
                            +{Number(order.platform_commission_amount || order.commission_amount).toLocaleString("tr-TR")} TL
                            <span className="text-gray-400 ml-1">(%{order.platform_commission_rate || order.commission_rate})</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-blue-600 text-right font-mono">
                            +{Number(order.agency_markup_amount || 0).toLocaleString("tr-TR")} TL
                            <span className="text-gray-400 ml-1">(%{order.agency_markup_rate || 0})</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-900 text-right font-mono">{Number(order.total_price).toLocaleString("tr-TR")} TL</td>
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
