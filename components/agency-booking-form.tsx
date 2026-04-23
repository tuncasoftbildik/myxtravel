"use client";

import { useState } from "react";

type Props = {
  productId: string;
  agencyContact?: { email?: string; phone?: string };
};

export function AgencyBookingForm({ productId, agencyContact }: Props) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    requested_date: "",
    passenger_count: 1,
    notes: "",
    company: "",
  });
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/public/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderilemedi");
      setState("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <p className="font-semibold text-green-800">Talebiniz alındı ✓</p>
        <p className="text-sm text-green-700 mt-1">Acenta kısa sürede sizinle iletişime geçecek.</p>
        {(agencyContact?.phone || agencyContact?.email) && (
          <p className="text-xs text-green-700 mt-3">
            İletişim: {agencyContact.phone}
            {agencyContact.phone && agencyContact.email ? " • " : ""}
            {agencyContact.email}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input hidden tabIndex={-1} autoComplete="off" name="company"
        value={form.company} onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))} />

      <input required placeholder="Ad Soyad" className="abf-input"
        value={form.customer_name} onChange={(e) => setForm((s) => ({ ...s, customer_name: e.target.value }))} />
      <input required type="email" placeholder="E-posta" className="abf-input"
        value={form.customer_email} onChange={(e) => setForm((s) => ({ ...s, customer_email: e.target.value }))} />
      <input required placeholder="Telefon" className="abf-input"
        value={form.customer_phone} onChange={(e) => setForm((s) => ({ ...s, customer_phone: e.target.value }))} />
      <input type="date" className="abf-input"
        value={form.requested_date} onChange={(e) => setForm((s) => ({ ...s, requested_date: e.target.value }))} />
      <input type="number" min="1" className="abf-input"
        value={form.passenger_count} onChange={(e) => setForm((s) => ({ ...s, passenger_count: Number(e.target.value) || 1 }))} />
      <textarea rows={3} placeholder="Notunuz (opsiyonel)" className="abf-input"
        value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button disabled={state === "submitting"} type="submit"
        className="bg-brand-red text-white rounded-lg px-5 py-3 font-medium w-full disabled:opacity-60">
        {state === "submitting" ? "Gönderiliyor..." : "Rezervasyon Talebi Gönder"}
      </button>

      <style>{`.abf-input { width:100%; padding:0.625rem 0.875rem; border:1px solid #e5e7eb; border-radius:0.5rem; background:white; }`}</style>
    </form>
  );
}
