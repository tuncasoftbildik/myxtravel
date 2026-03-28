import { NextResponse } from "next/server";
import { a2tour, Acente2Error } from "@/lib/acente2";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EnrichedTour {
  id: number;
  name: string;
  nights: number;
  transport: string;
  transportationType: string;
  departureCity: string;
  departureStops: string;
  placesToVisitStr: string;
  visaFree: number;
  dayTour: number;
  outgoingTour: number;
  cruise: number;
  tourCode: string;
  overnightInfo: string;
  accommodationInfo: string;
  image: string | null;
  minPrice: number | null;
  currency: string | null;
  nextDepartureDate: string | null;
  [key: string]: any;
}

// ─── In-memory cache ────────────────────────────────────────────────
let cachedData: { tours: EnrichedTour[]; timestamp: number } | null = null;
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours in ms

// ─── Concurrency helper ─────────────────────────────────────────────
async function pMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

// ─── Enrich a single tour ───────────────────────────────────────────
async function enrichTour(tour: any): Promise<EnrichedTour | null> {
  try {
    // Skip "Kapalı Grup" tours
    if (tour.name && tour.name.toLowerCase().includes("kapalı grup")) return null;
    const [detailRes, datesRes] = await Promise.all([
      a2tour.getTourDetail(tour.id).catch(() => null),
      a2tour.getTourDates(tour.id).catch(() => null),
    ]);

    // Image
    const images = (detailRes as any)?.result?.images;
    const image = Array.isArray(images) && images.length > 0 ? images[0].url : null;

    // Dates processing
    const rawDates = (datesRes as any)?.result;
    const datesList: any[] = Array.isArray(rawDates)
      ? rawDates
      : Array.isArray(rawDates?.list)
        ? rawDates.list
        : [];

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const validDates = datesList
      .filter((d: any) => {
        const dt = new Date(d.date);
        if (dt < tomorrow) return false;
        const remaining = (d.quota || 0) - (d.sold || 0);
        if (remaining <= 0) return false;
        return true;
      })
      .slice(0, 50);

    // Find min price
    let minPrice: number | null = null;
    let currency: string | null = null;

    for (const d of validDates) {
      const dpp = Number(d.dpp);
      if (!isNaN(dpp) && dpp > 0 && (minPrice === null || dpp < minPrice)) {
        minPrice = dpp;
        currency = d.currency || "TRY";
      }
      if (Array.isArray(d.list)) {
        for (const sub of d.list) {
          const sdpp = Number(sub.dpp);
          if (!isNaN(sdpp) && sdpp > 0 && (minPrice === null || sdpp < minPrice)) {
            minPrice = sdpp;
            currency = sub.currency || "TRY";
          }
        }
      }
    }

    // Skip tours with no valid price or no image
    if (!minPrice || minPrice <= 0) return null;
    if (!image) return null;

    // Next departure date (first valid date)
    const nextDepartureDate = validDates.length > 0 ? validDates[0].date : null;

    return {
      ...tour,
      image,
      minPrice,
      currency,
      nextDepartureDate,
    };
  } catch {
    return null;
  }
}

// ─── Main fetch + enrich ────────────────────────────────────────────
async function fetchEnrichedTours(): Promise<EnrichedTour[]> {
  const listResult = await a2tour.getTourList();
  const raw = (listResult as any)?.result as any;
  const tours: any[] = Array.isArray(raw?.list) ? raw.list : Array.isArray(raw) ? raw : [];

  // Enrich with concurrency limit of 8
  const enriched = await pMap(tours, enrichTour, 8);

  // Filter nulls (tours with no valid price) and sort cheapest first
  return enriched
    .filter((t): t is EnrichedTour => t !== null)
    .sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
}

// ─── Route handler ──────────────────────────────────────────────────
export async function GET() {
  try {
    // Return cached data if still valid
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(
        { success: true, count: cachedData.tours.length, tours: cachedData.tours, cached: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=10800, stale-while-revalidate=1800",
          },
        },
      );
    }

    // Fresh fetch
    const tours = await fetchEnrichedTours();
    cachedData = { tours, timestamp: Date.now() };

    return NextResponse.json(
      { success: true, count: tours.length, tours, cached: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10800, stale-while-revalidate=1800",
        },
      },
    );
  } catch (error) {
    // If cache exists but expired, still return it as fallback
    if (cachedData) {
      return NextResponse.json(
        { success: true, count: cachedData.tours.length, tours: cachedData.tours, cached: true, stale: true },
        {
          headers: {
            "Cache-Control": "public, s-maxage=600, stale-while-revalidate=10800",
          },
        },
      );
    }

    if (error instanceof Acente2Error) {
      return NextResponse.json(
        { error: error.message, details: error.responseData },
        { status: error.status || 500 },
      );
    }
    return NextResponse.json(
      { error: "Beklenmeyen hata oluştu" },
      { status: 500 },
    );
  }
}
