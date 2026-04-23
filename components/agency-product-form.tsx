"use client";

import { useState } from "react";
import type { ServiceType, TransferDetails, TourDetails } from "@/lib/agency-products/types";

type FormState = {
  title: string;
  short_description: string;
  description: string;
  photos: string[];
  cover_photo: string;
  price: string;
  currency: "TRY" | "USD" | "EUR";
  price_note: string;
  is_active: boolean;
  details: Partial<TransferDetails & TourDetails>;
};

type Props = {
  serviceType: ServiceType;
  initial?: Partial<FormState>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
};

export function AgencyProductForm({ serviceType, initial, onSubmit, submitLabel }: Props) {
  const [state, setState] = useState<FormState>({
    title: initial?.title || "",
    short_description: initial?.short_description || "",
    description: initial?.description || "",
    photos: initial?.photos || [],
    cover_photo: initial?.cover_photo || "",
    price: String(initial?.price ?? ""),
    currency: (initial?.currency as FormState["currency"]) || "TRY",
    price_note: initial?.price_note || "",
    is_active: initial?.is_active ?? true,
    details: (initial?.details as Partial<TransferDetails & TourDetails>) || {},
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "agency-products");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
    return data.url as string;
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    try {
      const urls = await Promise.all(
        Array.from(files).slice(0, 10 - state.photos.length).map(upload),
      );
      setState((s) => ({
        ...s,
        photos: [...s.photos, ...urls].slice(0, 10),
        cover_photo: s.cover_photo || urls[0] || "",
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme hatası");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        service_type: serviceType,
        title: state.title,
        short_description: state.short_description,
        description: state.description,
        photos: state.photos,
        cover_photo: state.cover_photo,
        price: Number(state.price),
        currency: state.currency,
        price_note: state.price_note,
        is_active: state.is_active,
        details: state.details,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  function setDetail<K extends keyof (TransferDetails & TourDetails)>(
    key: K,
    value: (TransferDetails & TourDetails)[K],
  ) {
    setState((s) => ({ ...s, details: { ...s.details, [key]: value } }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6">
      <Field label="Başlık">
        <input required className="ap-input" value={state.title}
          onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))} />
      </Field>

      <Field label="Kısa açıklama (1 cümle)">
        <input className="ap-input" value={state.short_description}
          onChange={(e) => setState((s) => ({ ...s, short_description: e.target.value }))} />
      </Field>

      <Field label="Açıklama">
        <textarea rows={6} className="ap-input" value={state.description}
          onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))} />
      </Field>

      <Field label={`Fotoğraflar (${state.photos.length}/10)`}>
        <input type="file" accept="image/*" multiple
          onChange={(e) => handleFiles(e.target.files)} />
        {state.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {state.photos.map((url) => (
              <label key={url} className="relative block border rounded-lg overflow-hidden cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full aspect-square object-cover" />
                <input type="radio" name="cover" className="absolute top-2 left-2"
                  checked={state.cover_photo === url}
                  onChange={() => setState((s) => ({ ...s, cover_photo: url }))} />
                <button type="button" className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setState((s) => ({
                      ...s,
                      photos: s.photos.filter((p) => p !== url),
                      cover_photo: s.cover_photo === url ? (s.photos.find((p) => p !== url) || "") : s.cover_photo,
                    }));
                  }}>
                  ×
                </button>
              </label>
            ))}
          </div>
        )}
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Fiyat">
          <input required type="number" step="0.01" min="0" className="ap-input" value={state.price}
            onChange={(e) => setState((s) => ({ ...s, price: e.target.value }))} />
        </Field>
        <Field label="Para birimi">
          <select className="ap-input" value={state.currency}
            onChange={(e) => setState((s) => ({ ...s, currency: e.target.value as FormState["currency"] }))}>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </Field>
        <Field label="Fiyat notu">
          <input className="ap-input" placeholder="kişi başı / araç başı" value={state.price_note}
            onChange={(e) => setState((s) => ({ ...s, price_note: e.target.value }))} />
        </Field>
      </div>

      {serviceType === "transfer" ? (
        <TransferFields detail={state.details as TransferDetails} set={setDetail} />
      ) : (
        <TourFields detail={state.details as TourDetails} set={setDetail} />
      )}

      <Field label="">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={state.is_active}
            onChange={(e) => setState((s) => ({ ...s, is_active: e.target.checked }))} />
          Aktif (müşterilere görünür)
        </label>
      </Field>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button disabled={saving} type="submit"
        className="bg-brand-red text-white rounded-lg px-6 py-3 font-medium disabled:opacity-60">
        {saving ? "Kaydediliyor..." : submitLabel}
      </button>

      <style>{`.ap-input { width:100%; padding:0.625rem 0.875rem; border:1px solid #e5e7eb; border-radius:0.5rem; background:white; }`}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      {children}
    </div>
  );
}

function ChipInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (!v) return;
    onChange([...value, v]);
    setInput("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((v, i) => (
          <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-1">
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="ap-input flex-1" placeholder={placeholder}
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="px-3 border rounded-lg">Ekle</button>
      </div>
    </div>
  );
}

function TransferFields({
  detail,
  set,
}: {
  detail: TransferDetails;
  set: <K extends keyof TransferDetails>(k: K, v: TransferDetails[K]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Nereden">
        <input required className="ap-input" value={detail.from_location || ""}
          onChange={(e) => set("from_location", e.target.value)} />
      </Field>
      <Field label="Nereye">
        <input required className="ap-input" value={detail.to_location || ""}
          onChange={(e) => set("to_location", e.target.value)} />
      </Field>
      <Field label="Araç tipi">
        <select className="ap-input" value={detail.vehicle_type || "sedan"}
          onChange={(e) => set("vehicle_type", e.target.value as TransferDetails["vehicle_type"])}>
          <option value="sedan">Sedan</option>
          <option value="minivan">Minivan</option>
          <option value="minibus">Minibüs</option>
          <option value="bus">Otobüs</option>
        </select>
      </Field>
      <Field label="Max yolcu">
        <input required type="number" min="1" className="ap-input" value={detail.max_passengers || ""}
          onChange={(e) => set("max_passengers", Number(e.target.value))} />
      </Field>
      <Field label="Süre (dk)">
        <input type="number" min="1" className="ap-input" value={detail.duration_minutes || ""}
          onChange={(e) => set("duration_minutes", Number(e.target.value) || undefined)} />
      </Field>
      <Field label="">
        <label className="flex items-center gap-2 mt-6">
          <input type="checkbox" checked={!!detail.round_trip}
            onChange={(e) => set("round_trip", e.target.checked)} />
          Gidiş-dönüş
        </label>
      </Field>
      <div className="col-span-2">
        <Field label="Dahil olanlar">
          <ChipInput value={detail.includes || []} onChange={(v) => set("includes", v)} placeholder="VIP karşılama, su ikramı..." />
        </Field>
      </div>
    </div>
  );
}

function TourFields({
  detail,
  set,
}: {
  detail: TourDetails;
  set: <K extends keyof TourDetails>(k: K, v: TourDetails[K]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Süre (gün)">
        <input required type="number" min="1" className="ap-input" value={detail.duration_days || ""}
          onChange={(e) => set("duration_days", Number(e.target.value))} />
      </Field>
      <Field label="Süre (gece)">
        <input required type="number" min="0" className="ap-input" value={detail.duration_nights || ""}
          onChange={(e) => set("duration_nights", Number(e.target.value))} />
      </Field>
      <Field label="Kalkış noktası">
        <input className="ap-input" value={detail.departure_point || ""}
          onChange={(e) => set("departure_point", e.target.value)} />
      </Field>
      <Field label="Buluşma noktası">
        <input className="ap-input" value={detail.meeting_point || ""}
          onChange={(e) => set("meeting_point", e.target.value)} />
      </Field>
      <div className="col-span-2">
        <Field label="Öne çıkanlar"><ChipInput value={detail.highlights || []} onChange={(v) => set("highlights", v)} /></Field>
      </div>
      <div className="col-span-2">
        <Field label="Dahil olanlar"><ChipInput value={detail.includes || []} onChange={(v) => set("includes", v)} /></Field>
      </div>
      <div className="col-span-2">
        <Field label="Dahil olmayanlar"><ChipInput value={detail.excludes || []} onChange={(v) => set("excludes", v)} /></Field>
      </div>
      <div className="col-span-2">
        <Field label="Diller"><ChipInput value={detail.languages || []} onChange={(v) => set("languages", v)} placeholder="Türkçe, İngilizce..." /></Field>
      </div>
    </div>
  );
}
