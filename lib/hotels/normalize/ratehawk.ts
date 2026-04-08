import type { RhHotelResult, RhRate } from "@/lib/ratehawk/types";
import type { UnifiedHotel } from "../types";

function pickPrice(rate: RhRate): { total: number; currency: string } {
  const pt = rate.payment_options?.payment_types?.[0];
  if (pt) {
    const amount = parseFloat(pt.show_amount || pt.amount || "0");
    const currency = pt.show_currency_code || pt.currency_code || "EUR";
    return { total: isNaN(amount) ? 0 : amount, currency };
  }
  // Fallback: sum daily prices
  const daily = rate.daily_prices || [];
  const total = daily.reduce((acc, d) => acc + parseFloat(d.amount || "0"), 0);
  return { total, currency: daily[0]?.currency_code || "EUR" };
}

function cheapestRate(rates: RhRate[]): RhRate | null {
  if (!rates.length) return null;
  return rates.reduce((min, r) => {
    const a = pickPrice(r).total;
    const b = pickPrice(min).total;
    return a > 0 && (b === 0 || a < b) ? r : min;
  }, rates[0]);
}

/**
 * Convert a RateHawk hotel result into UnifiedHotel.
 * RateHawk SERP is rate-centric and does not include hotel metadata
 * (name, stars, images) — those come from the Hotel Info static dump.
 * Caller should hydrate metadata from a cached info source if desired.
 */
export function normalizeRatehawkHotel(
  h: RhHotelResult,
  meta?: Partial<Pick<UnifiedHotel, "name" | "stars" | "thumbnail" | "address" | "city" | "country" | "location">>,
): UnifiedHotel | null {
  const rate = cheapestRate(h.rates);
  if (!rate) return null;

  const price = pickPrice(rate);

  return {
    supplier: "ratehawk",
    supplierHotelId: h.id,
    key: `ratehawk:${h.id}`,
    name: meta?.name || h.id,
    stars: meta?.stars ?? 0,
    thumbnail: meta?.thumbnail ?? null,
    address: meta?.address ?? null,
    city: meta?.city ?? null,
    country: meta?.country ?? null,
    location: meta?.location ?? { lat: null, lng: null },
    boardCode: rate.meal || "",
    boardName: rate.meal_data?.value || rate.meal || "",
    rateToken: rate.book_hash,
    price: {
      total: price.total,
      currency: price.currency,
    },
  };
}
