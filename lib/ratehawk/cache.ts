import { getServiceSupabase } from "@/lib/supabase/service";
import type { RhHotelInfo } from "./types";

/**
 * Supabase-backed TTL cache for RateHawk hotel metadata. The aggregator
 * consults this cache before issuing /hotel/info/ calls — misses are filled
 * from the API and written back. Non-fatal on any DB error: a failing cache
 * layer must never break a live search.
 */

const TABLE = "ratehawk_hotel_info_cache";

export async function getCachedHotelInfo(
  ids: string[],
): Promise<Map<string, RhHotelInfo>> {
  const out = new Map<string, RhHotelInfo>();
  if (!ids.length) return out;

  try {
    const sb = getServiceSupabase();
    const { data, error } = await sb
      .from(TABLE)
      .select("id, data, expires_at")
      .in("id", ids);

    if (error) {
      console.warn("[ratehawk.cache] read error", error.message);
      return out;
    }

    const now = Date.now();
    for (const row of data || []) {
      const exp = row.expires_at ? new Date(row.expires_at).getTime() : 0;
      if (exp > now && row.data) {
        out.set(row.id as string, row.data as RhHotelInfo);
      }
    }
  } catch (err) {
    console.warn("[ratehawk.cache] read threw", (err as Error).message);
  }

  return out;
}

export async function setCachedHotelInfo(
  entries: Map<string, RhHotelInfo>,
): Promise<void> {
  if (!entries.size) return;

  try {
    const sb = getServiceSupabase();
    const rows = Array.from(entries.entries()).map(([id, data]) => ({
      id,
      hid: typeof data.hid === "number" ? data.hid : null,
      data,
      fetched_at: new Date().toISOString(),
      // 7-day TTL — matches migration default, kept explicit for clarity.
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { error } = await sb.from(TABLE).upsert(rows, { onConflict: "id" });
    if (error) {
      console.warn("[ratehawk.cache] write error", error.message);
    }
  } catch (err) {
    console.warn("[ratehawk.cache] write threw", (err as Error).message);
  }
}

/**
 * Cache-aware hotelInfoBatch wrapper. Looks up the cache first, fetches only
 * missing ids via the provided fetcher (usually rhHotel.hotelInfoBatch), then
 * writes the fetched rows back. The fetcher is injected to avoid a circular
 * import with lib/ratehawk/services/hotel.ts.
 */
export async function hotelInfoBatchCached(
  ids: string[],
  fetcher: (missing: string[]) => Promise<Map<string, RhHotelInfo>>,
): Promise<Map<string, RhHotelInfo>> {
  if (!ids.length) return new Map();

  const unique = Array.from(new Set(ids));
  const cached = await getCachedHotelInfo(unique);
  const missing = unique.filter((id) => !cached.has(id));

  if (!missing.length) return cached;

  const fetched = await fetcher(missing);
  if (fetched.size) {
    // Fire-and-forget write; do not block the search on cache persistence.
    void setCachedHotelInfo(fetched);
  }

  for (const [id, info] of fetched) {
    cached.set(id, info);
  }
  return cached;
}
