"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";

interface Order {
  id: string;
  order_type: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  base_price: number;
  platform_commission_amount: number;
  agency_markup_amount: number;
  total_price: number;
  status: string;
  created_at: string;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  flight: "Ucak",
  hotel: "Otel",
  bus: "Otobus",
  car: "Arac Kiralama",
  transfer: "Transfer",
  tour: "Tur",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-amber-50 text-amber-600" },
  confirmed: { label: "Onayli", color: "bg-blue-50 text-blue-600" },
  completed: { label: "Tamamlandi", color: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Iptal", color: "bg-red-50 text-red-500" },
  refunded: { label: "Iade", color: "bg-purple-50 text-purple-600" },
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

export default function AcentaSiparisler() {
  const { isAgencyUser, isLoggedIn, loading: authLoading } = useAgencyAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getMonthOptions()[0].value);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    total_orders: number;
    total_revenue: number;
    total_agency_markup: number;
  } | null>(null);

  useEffect(() => {
    if (!isAgencyUser) return;
    fetchOrders();
  }, [isAgencyUser, selectedMonth, selectedStatus]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
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

  if (!isLoggedIn || !isAgencyUser) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600">Bu sayfaya erisim yetkiniz bulunmamaktadir.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Siparislerim</h1>
              <p className="text-sm text-gray-500 mt-1">Satis gecmisi ve siparis takibi</p>
            </div>
            <Link href="/acenta/panel" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Donem</label>
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
                  <option value="">Tumu</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Siparis</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_orders}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Toplam Satis</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_revenue.toLocaleString("tr-TR")} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Kazanciniz</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.total_agency_markup.toLocaleString("tr-TR")} TL</p>
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
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tur</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Urun</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Musteri</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Satis Fiyati</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Kazanciniz</th>
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
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium text-gray-600">
                              {ORDER_TYPE_LABELS[order.order_type] || order.order_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{order.product_name}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{order.customer_name || order.customer_email || "—"}</td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-900 text-right font-mono">
                            {Number(order.total_price).toLocaleString("tr-TR")} TL
                          </td>
                          <td className="px-4 py-3 text-xs text-emerald-600 text-right font-mono">
                            +{Number(order.agency_markup_amount || 0).toLocaleString("tr-TR")} TL
                          </td>
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
