import { NextRequest, NextResponse } from "next/server";
import { hotel } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";
import { searchHotels } from "@/lib/hotels";
import type { UnifiedHotel, UnifiedSearchParams } from "@/lib/hotels";

/**
 * Multi-supplier hotel search. TravelRobot remains the primary source; RateHawk
 * is queried in parallel when enabled via HOTEL_SUPPLIERS env. Response shape
 * is backward-compatible with the existing UI, with an added `supplier` field
 * per hotel and a `suppliers` diagnostic array.
 */

function toWire(h: UnifiedHotel) {
  return {
    supplier: h.supplier,
    productCode: h.supplierHotelId,
    name: h.name,
    stars: h.stars,
    thumbnail: h.thumbnail,
    address: h.address,
    location: h.location.lat != null ? { lat: h.location.lat, lng: h.location.lng } : null,
    city: h.city,
    country: h.country,
    boardType: h.boardCode,
    boardName: h.boardName,
    searchKey: h.rateToken,
    price: h.price,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      checkIn,
      checkOut,
      nationality = "TR",
      adults = 2,
      children = 0,
      childAges = [],
      destinationId,
      regionId, // optional — RateHawk region id
      currency,
    } = body;

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Giriş ve çıkış tarihi zorunludur" },
        { status: 400 },
      );
    }

    const params: UnifiedSearchParams = {
      checkIn,
      checkOut,
      nationality,
      adults,
      children,
      childAges,
      destinationId,
      regionId,
      currency,
    };

    // TravelRobot fetcher — keeps kplus-specific request plumbing out of the
    // aggregator. Returns the raw hotel items and the session searchId.
    async function travelrobotFetcher() {
      const paxes: Record<string, unknown>[] = [];
      if (adults > 0) paxes.push({ Count: adults, PaxType: 0 });
      if (children > 0) paxes.push({ Count: children, PaxType: 1, ChildAgeList: childAges });

      const DEFAULT_DESTINATIONS = [16, 20, 1000, 1002, 1003, 1007, 1009];
      const destIds = destinationId ? [Number(destinationId)] : DEFAULT_DESTINATIONS;

      const buildSearchBody = (destId: number) => ({
        CheckInDate: checkIn,
        CheckOutDate: checkOut,
        NationalityCode: nationality,
        Rooms: [{ Paxes: paxes }],
        ShowMultipleRate: "false",
        Destinations: [{ DestinationId: destId }],
      });

      const extractItems = (result: unknown) => {
        const data = result as Record<string, unknown>;
        const resultData = data.Result as Record<string, unknown> | null;
        const items =
          (resultData?.Hotels as Record<string, unknown>[]) ||
          (resultData?.Results as Record<string, unknown>[]) ||
          (resultData?.SearchResult as Record<string, unknown>[]) ||
          [];
        const sid = (resultData?.SearchFilter as Record<string, unknown>)?.SearchKey as string | null;
        return { items, searchId: sid ?? null };
      };

      if (destIds.length === 1) {
        const res = await hotel.searchHotel(
          buildSearchBody(destIds[0]) as Parameters<typeof hotel.searchHotel>[0],
        );
        const { items, searchId } = extractItems(res);
        return { rawItems: items, searchId };
      }

      const settled = await Promise.allSettled(
        destIds.map((id) =>
          hotel.searchHotel(buildSearchBody(id) as Parameters<typeof hotel.searchHotel>[0]),
        ),
      );
      const rawItems: Record<string, unknown>[] = [];
      for (const r of settled) {
        if (r.status === "fulfilled") {
          rawItems.push(...extractItems(r.value).items);
        }
      }
      return { rawItems, searchId: null };
    }

    const result = await searchHotels(params, travelrobotFetcher);

    return NextResponse.json({
      success: true,
      count: result.hotels.length,
      searchId: result.searchId,
      suppliers: result.suppliers,
      hotels: result.hotels.map(toWire),
    });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json(
        { error: error.message, details: error.responseData },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Beklenmeyen hata oluştu", message: (error as Error).message },
      { status: 500 },
    );
  }
}
