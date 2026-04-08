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
export function bookFinish(body: Record<string, unknown>) {
  return ratehawkRequest<unknown>({
    path: "/hotel/order/booking/finish/",
    body,
  });
}

/**
 * Step 5: poll booking status. Finish is async on RH — `data` often
 * comes back null and the partner must poll this endpoint until the
 * order reaches a terminal state (`success`, `soldout`, `book_limit`).
 */
export function bookFinishStatus(partnerOrderId: string) {
  return ratehawkRequest<unknown>({
    path: "/hotel/order/booking/finish/status/",
    body: { partner_order_id: partnerOrderId },
  });
}

/**
 * Poll /finish/status/ with exponential-ish backoff until the order
 * hits a terminal state or maxAttempts is exhausted. Returns the
 * final response along with the resolved status string.
 *
 * Terminal statuses per RH cert: `success`, `soldout`, `book_limit`.
 * Interim statuses (`init`, `processing`, `in_progress`, `waiting_payment`)
 * cause retry. Anything else is treated as unknown and retried too.
 */
export async function pollFinishStatus(
  partnerOrderId: string,
  opts: { maxAttempts?: number; intervalMs?: number; onTick?: (a: number, p: number) => void } = {},
) {
  const maxAttempts = opts.maxAttempts ?? 20;
  const base = opts.intervalMs ?? 2000;

  let lastRes: Record<string, unknown> = {};
  let lastError: string | null = null;
  for (let i = 0; i < maxAttempts; i++) {
    let res: Record<string, unknown>;
    try {
      res = (await bookFinishStatus(partnerOrderId)) as Record<string, unknown>;
    } catch (err) {
      // RH status endpoint returns status:error with error codes.
      // - error=unknown → transient, keep polling (unknown_* async cases)
      // - error=soldout / book_limit → TERMINAL (cert expects this as the
      //   final state for unknown_soldout / unknown_book_limit suffixes).
      const e = err as { message?: string; body?: Record<string, unknown> };
      lastError = (e.body?.error as string) || e.message || "error";
      if (lastError === "soldout" || lastError === "book_limit") {
        return {
          status: lastError,
          response: (e.body as Record<string, unknown>) || {},
          attempts: i + 1,
          percent: 100,
        };
      }
      opts.onTick?.(i + 1, -1);
      const wait = Math.min(base + i * 500, 5000);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    lastRes = res;
    // RH finish/status response shape: `{ partner_order_id, percent, data_3ds, prepayment, order? }`.
    // Progress tracked via `percent` (0..100). `order` / `order_id` appear
    // only once terminal. Cert terminal states (success/soldout/book_limit)
    // surface under `order.status` once percent=100.
    const percent = typeof res?.percent === "number" ? (res.percent as number) : 0;
    opts.onTick?.(i + 1, percent);
    const order = (res?.order as Record<string, unknown>) || undefined;
    const orderStatus = (order?.status as string) || (res?.status as string);

    if (percent >= 100 || orderStatus) {
      const finalStatus =
        orderStatus ||
        (order?.order_id ? "success" : "success"); // percent=100 w/o explicit status → treat as success
      return { status: finalStatus, response: res, attempts: i + 1, percent };
    }
    // Backoff: 2s, 2.5s, 3s, ... capped
    const wait = Math.min(base + i * 500, 5000);
    await new Promise((r) => setTimeout(r, wait));
  }
  return {
    status: (lastError ? `error:${lastError}` : "timeout") as string,
    response: lastRes,
    attempts: maxAttempts,
    percent: (lastRes?.percent as number) || 0,
  };
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
