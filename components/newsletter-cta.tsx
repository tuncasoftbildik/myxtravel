"use client";

import { useState } from "react";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("Bir hata oluştu, lütfen tekrar deneyin.");
    }

    setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d1b69] to-[#0f172a]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
          Fırsatları İlk Sen Yakala
        </h2>
        <p className="text-white/50 mb-10 max-w-lg mx-auto">
          E-bültenimize abone olun, özel indirimlerden ve erken rezervasyon fırsatlarından anında haberdar olun.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-5 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red/50 text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-8 py-4 bg-brand-red text-white font-semibold rounded-2xl hover:bg-red-700 transition text-sm whitespace-nowrap disabled:opacity-50"
          >
            {status === "loading" ? "Gönderiliyor..." : "Abone Ol"}
          </button>
        </form>

        {status !== "idle" && status !== "loading" && (
          <p className={`mt-4 text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
