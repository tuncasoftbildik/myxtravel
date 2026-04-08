import { ratehawkRequest } from "../client";
import type {
  RhSearchRequest,
  RhSearchResponse,
  RhPrebookRequest,
  RhBookRequest,
  RhHotelInfo,
} from "../types";

/**
 * RateHawk B2B v3 hotel endpoints.
 * Each endpoint is a POST to /api/b2b/v3/search/serp/...
 */

/** Search by region (city/area). */
export function searchByRegion(req: RhSearchRequest) {
  return ratehawkRequest<RhSearchResponse>({
    path: "/search/serp/region/",
    body: req as unknown as Record<string, unknown>,
  });
}

/** Search by specific hotel ids (1..300). */
export function searchByHotels(req: RhSearchRequest) {
  return ratehawkRequest<RhSearchResponse>({
    path: "/search/serp/hotels/",
    body: req as unknown as Record<string, unknown>,
  });
}

/** Single-hotel details + live rates (HP — Hotel Page). */
export function hotelPage(req: RhSearchRequest & { id: string }) {
  return ratehawkRequest<RhSearchResponse>({
    path: "/search/hp/",
    body: req as unknown as Record<string, unknown>,
  });
}

/** Step 2: prebook rate and get final price + policies. */
export function prebook(req: RhPrebookRequest) {
  return ratehawkRequest<unknown>({
    path: "/hotel/prebook/",
    body: req as unknown as Record<string, unknown>,
  });
}

/** Step 3: create booking form (partner_order_id). */
export function bookFormPartner(req: RhBookRequest) {
  return ratehawkRequest<unknown>({
    path: "/hotel/order/booking/form/",
    body: req as unknown as Record<string, unknown>,
  });
}

/** Step 4: finish booking (commit). */
export function bookFinish(partner_order_id: string) {
  return ratehawkRequest<unknown>({
    path: "/hotel/order/booking/finish/",
    body: { partner_order_id },
  });
}

/**
 * Fetch static hotel metadata (name, stars, images, address, region).
 * Rates are NOT returned here — use SERP endpoints for pricing.
 */
export function hotelInfo(id: string, language = "en") {
  return ratehawkRequest<RhHotelInfo>({
    path: "/hotel/info/",
    body: { id, language },
  });
}

/**
 * Fetch metadata for many hotels in parallel. Returns a Map keyed by slug id.
 * Failures are swallowed per-hotel so one bad id does not break the batch.
 */
export async function hotelInfoBatch(
  ids: string[],
  language = "en",
): Promise<Map<string, RhHotelInfo>> {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  const results = await Promise.allSettled(
    unique.map((id) => hotelInfo(id, language)),
  );
  const map = new Map<string, RhHotelInfo>();
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) {
      map.set(unique[i], r.value);
    }
  });
  return map;
}

/** Simple sandbox ping via overview endpoint. */
export function overview() {
  return ratehawkRequest<unknown>({
    path: "/overview/",
    body: {},
  });
}
