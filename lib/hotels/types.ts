/**
 * Supplier-agnostic hotel types. All supplier responses normalize into these
 * so the UI, prebook, and booking layers only deal with one shape.
 */

export type HotelSupplier = "travelrobot" | "ratehawk";

export interface UnifiedPrice {
  total: number;
  currency: string;
  base?: number;
  discount?: number;
}

export interface UnifiedHotelLocation {
  lat: number | null;
  lng: number | null;
}

export interface UnifiedHotel {
  /** Supplier that produced this result. Required for prebook/book routing. */
  supplier: HotelSupplier;
  /** Supplier-native hotel id (HotelCode / ratehawk id). */
  supplierHotelId: string;
  /** Stable cross-supplier key = `${supplier}:${supplierHotelId}`. */
  key: string;
  name: string;
  stars: number;
  thumbnail: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  location: UnifiedHotelLocation;
  boardCode: string;
  boardName: string;
  /**
   * Opaque supplier-specific token needed to prebook this specific rate.
   * TravelRobot: RoomCode / SearchKey
   * RateHawk:    book_hash
   */
  rateToken: string;
  price: UnifiedPrice;
}

export interface UnifiedSearchParams {
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  nationality: string; // ISO-2
  adults: number;
  children: number;
  childAges: number[];
  destinationId?: string | number;
  regionId?: number; // ratehawk
  currency?: string;
}

export interface UnifiedSearchResult {
  hotels: UnifiedHotel[];
  /** Per-supplier diagnostic info (errors, counts, timings). */
  suppliers: Array<{
    supplier: HotelSupplier;
    ok: boolean;
    count: number;
    ms: number;
    error?: string;
  }>;
  /** TravelRobot-specific session key when present (back-compat). */
  searchId?: string | null;
}
