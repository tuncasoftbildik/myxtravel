import { NextRequest, NextResponse } from "next/server";
import { hotel } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkIn, checkOut, nationality = "TR", adults = 2, children = 0, childAges = [], destinationId } = body;

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Giriş ve çıkış tarihi zorunludur" },
        { status: 400 },
      );
    }

    const paxes: Record<string, unknown>[] = [];
    if (adults > 0) paxes.push({ Count: adults, PaxType: 0 });
    if (children > 0) paxes.push({ Count: children, PaxType: 1, ChildAgeList: childAges });

    // API requires at least one destination — if none given, search popular ones in parallel
    const DEFAULT_DESTINATIONS = [16, 20, 1000, 1002, 1003, 1007, 1009];
    const destIds = destinationId ? [Number(destinationId)] : DEFAULT_DESTINATIONS;

    function buildSearchBody(destId: number) {
      return {
        CheckInDate: checkIn,
        CheckOutDate: checkOut,
        NationalityCode: nationality,
        Rooms: [{ Paxes: paxes }],
        ShowMultipleRate: "false",
        Destinations: [{ DestinationId: destId }],
      };
    }

    function parseResults(result: unknown) {
      const data = result as Record<string, unknown>;
      const resultData = data.Result as Record<string, unknown> | null;
      const searchResults =
        (resultData?.Hotels as Record<string, unknown>[]) ||
        (resultData?.Results as Record<string, unknown>[]) ||
        (resultData?.SearchResult as Record<string, unknown>[]) ||
        [];
      const searchId = (resultData?.SearchFilter as Record<string, unknown>)?.SearchKey as string | null;

      const hotels = (searchResults as Record<string, unknown>[]).map((item) => {
        const h = item.Hotel as Record<string, unknown> | null;
        // Price comes from first room alternative
        const rooms = item.Rooms as Record<string, unknown>[] | null;
        const firstRoom = rooms?.[0] as Record<string, unknown> | null;
        const roomAlts = firstRoom?.RoomAlternatives as Record<string, unknown>[] | null;
        const firstAlt = roomAlts?.[0] as Record<string, unknown> | null;
        const geo = h?.GeoLocation as Record<string, unknown> | null;

        return {
          productCode: h?.HotelCode,
          name: h?.HotelName || h?.Name,
          stars: h?.Star || h?.Stars || 0,
          thumbnail: h?.HotelImageURL || h?.ThumbnailUrl || h?.Thumbnail,
          address: h?.Address,
          location: geo ? { lat: geo.Latitude, lng: geo.Longitude } : null,
          city: h?.Location || h?.CityName || h?.City,
          country: h?.CountryCode || h?.CountryName || h?.Country,
          boardType: firstAlt?.BoardCode || "",
          boardName: firstAlt?.BoardName || "",
          searchKey: firstAlt?.RoomCode || "",
          price: {
            total: firstAlt?.TotalAmount || 0,
            currency: firstAlt?.CurrencyCode || "TRY",
            base: firstAlt?.BaseAmount || 0,
            discount: firstAlt?.DiscountAmount || 0,
          },
        };
      });

      return { hotels, searchId };
    }

    // Single destination — single request
    if (destIds.length === 1) {
      const result = await hotel.searchHotel(buildSearchBody(destIds[0]) as Parameters<typeof hotel.searchHotel>[0]);
      const { hotels, searchId } = parseResults(result);
      return NextResponse.json({ success: true, count: hotels.length, searchId, hotels });
    }

    // Multiple destinations — parallel requests, collect all results
    const results = await Promise.allSettled(
      destIds.map((id) => hotel.searchHotel(buildSearchBody(id) as Parameters<typeof hotel.searchHotel>[0]))
    );

    const allHotels: ReturnType<typeof parseResults>["hotels"] = [];
    for (const r of results) {
      if (r.status === "fulfilled") {
        const { hotels: h } = parseResults(r.value);
        allHotels.push(...h);
      }
    }

    // Sort by price ascending
    allHotels.sort((a, b) => ((a.price.total as number) || 0) - ((b.price.total as number) || 0));

    return NextResponse.json({
      success: true,
      count: allHotels.length,
      searchId: null,
      hotels: allHotels,
    });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json(
        { error: error.message, details: error.responseData },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Beklenmeyen hata oluştu" },
      { status: 500 },
    );
  }
}
