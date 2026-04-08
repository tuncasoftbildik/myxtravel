import type { UnifiedHotel } from "../types";

/**
 * Convert a raw TravelRobot SERP hotel item into UnifiedHotel.
 * Shape of input matches the parsing already in app/api/hotels/search/route.ts
 * (item.Hotel + item.Rooms[0].RoomAlternatives[0]).
 */
export function normalizeTravelrobotHotel(item: Record<string, unknown>): UnifiedHotel | null {
  const h = item.Hotel as Record<string, unknown> | null;
  if (!h) return null;

  const rooms = item.Rooms as Record<string, unknown>[] | null;
  const firstRoom = rooms?.[0] as Record<string, unknown> | null;
  const roomAlts = firstRoom?.RoomAlternatives as Record<string, unknown>[] | null;
  const firstAlt = roomAlts?.[0] as Record<string, unknown> | null;
  if (!firstAlt) return null;

  const geo = h.GeoLocation as Record<string, unknown> | null;
  const supplierHotelId = String(h.HotelCode ?? "");
  if (!supplierHotelId) return null;

  return {
    supplier: "travelrobot",
    supplierHotelId,
    key: `travelrobot:${supplierHotelId}`,
    name: String(h.HotelName || h.Name || ""),
    stars: Number(h.Star || h.Stars || 0),
    thumbnail:
      (h.HotelImageURL as string | undefined) ||
      (h.ThumbnailUrl as string | undefined) ||
      (h.Thumbnail as string | undefined) ||
      null,
    address: (h.Address as string | undefined) ?? null,
    city: (h.Location as string | undefined) || (h.CityName as string | undefined) || (h.City as string | undefined) || null,
    country:
      (h.CountryCode as string | undefined) ||
      (h.CountryName as string | undefined) ||
      (h.Country as string | undefined) ||
      null,
    location: geo
      ? { lat: Number(geo.Latitude) || null, lng: Number(geo.Longitude) || null }
      : { lat: null, lng: null },
    boardCode: String(firstAlt.BoardCode || ""),
    boardName: String(firstAlt.BoardName || ""),
    rateToken: String(firstAlt.RoomCode || ""),
    price: {
      total: Number(firstAlt.TotalAmount) || 0,
      currency: String(firstAlt.CurrencyCode || "TRY"),
      base: Number(firstAlt.BaseAmount) || 0,
      discount: Number(firstAlt.DiscountAmount) || 0,
    },
  };
}
