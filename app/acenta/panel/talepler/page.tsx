"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";
import type { BookingStatus } from "@/lib/agency-products/types";

type RequestRow = {
  id: string;
  product_id: string;
  product?: { title: string; service_type: string; slug: string };
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  requested_date: string | null;
  passenger_count: number;
  notes: string;
  status: BookingStatus;
  agency_notes: string;
  created_at: string;
};

const TABS: { key: BookingStatus; label: string }[] = [
  { key: "new", label: "Yeni" },
  { key: "contacted", label: "İletişime Geçildi" },
  { key: "confirmed", label: "Onaylandı" },
  { key: "completed", label: "Tamamlandı" },
  { key: "cancelled", label: "İptal" },
];

function phoneToWa(raw: string) {
  const digits = raw.replace(/\D+/g, "");
  const withCountry = digits.startsWith("0") ? "90" + digits.slice(1) : digits;
  return `https://wa.me/${withCountry}`;
}

export default function TaleplerPage() {
  const { isAgencyUser, isLoggedIn, loading: authLoading } = useAgencyAuth();
  const [tab, setTab] = useState<BookingStatus>("new");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAgencyUser) return;
    setLoading(true);
    fetch(`/api/agency/bookings?status=${tab}`)
      .then((r) => r.json())
      .then((d) => setRows(d.requests || []))
      .finally(() => setLoading(false));
  }, [isAgencyUser, tab]);

  async function update(id: string, patch: Partial<Pick<RequestRow, "status" | "agency_notes">>) {
    const res = await fetch(`/api/agency/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    if (patch.status && patch.status !== tab) {
      setRows((xs) => xs.filter((r) => r.id !== id));
    } else {
      setRows((xs) => xs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    }
  }

  if (authLoading) return null;
  if (!isLoggedIn || !isAgencyUser) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Rezervasyon Talepleri</h1>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${tab === t.key ? "bg-brand-red text-white" : "bg-white text-gray-700"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500">Bu kategoride talep yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold">{r.customer_name}</p>
                      <p className="text-sm text-gray-500">{r.product?.title || "Ürün silinmiş"}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.created_at).toLocaleString("tr-TR")}
                        {r.requested_date ? ` • İstenen tarih: ${r.requested_date}` : ""}
                        {` • ${r.passenger_count} kişi`}
                      </p>
                    </div>
                    <div className="flex gap-3 items-center">
                      <a href={`tel:${r.customer_phone}`} className="text-sm text-blue-600">📞 Ara</a>
                      <a href={phoneToWa(r.customer_phone)} target="_blank" rel="noopener" className="text-sm text-green-600">💬 WhatsApp</a>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>📧 {r.customer_email}</div>
                    <div>📱 {r.customer_phone}</div>
                  </div>
                  {r.notes && (
                    <p className="mt-3 text-sm bg-gray-50 rounded p-2">Müşteri notu: {r.notes}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 items-center">
                    <select className="border rounded px-2 py-1 text-sm" value={r.status}
                      onChange={(e) => update(r.id, { status: e.target.value as BookingStatus })}>
                      {TABS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                    <input className="border rounded px-2 py-1 text-sm flex-1 min-w-48"
                      placeholder="Acenta notu (müşteri görmez)"
                      defaultValue={r.agency_notes}
                      onBlur={(e) => {
                        if (e.target.value !== r.agency_notes) update(r.id, { agency_notes: e.target.value });
                      }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
