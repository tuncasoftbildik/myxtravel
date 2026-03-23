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

    const searchBody: Record<string, unknown> = {
      CheckInDate: checkIn,
      CheckOutDate: checkOut,
      NationalityCode: nationality,
      Rooms: [{ Paxes: paxes }],
      ShowMultipleRate: "false",
    };

    if (destinationId) {
      searchBody.Destinations = [{ DestinationId: Number(destinationId) }];
    }

    const result = await hotel.searchHotel(searchBody as Parameters<typeof hotel.searchHotel>[0]);

    const data = result as Record<string, unknown>;
    const resultData = data.Result as Record<string, unknown> | null;
    const searchResults =
      (resultData?.Hotels as Record<string, unknown>[]) ||
      (resultData?.Results as Record<string, unknown>[]) ||
      (resultData?.SearchResult as Record<string, unknown>[]) ||
      [];
    const searchId = resultData?.Id as string | null;

    const hotels = (searchResults as Record<string, unknown>[]).map((item) => {
      const h = item.Hotel as Record<string, unknown> | null;
      const p = item.Price as Record<string, unknown> | null;
      const loc = h?.Location as Record<string, unknown> | null;

      return {
        productCode: h?.ProductCode,
        name: h?.Name,
        stars: h?.Stars,
        thumbnail: h?.ThumbnailUrl || h?.Thumbnail,
        address: h?.Address,
        location: loc ? { lat: loc.Latitude, lng: loc.Longitude } : null,
        city: h?.CityName || h?.City,
        country: h?.CountryName || h?.Country,
        boardType: h?.BoardType,
        boardName: h?.BoardName,
        searchKey: item.SearchKey,
        price: {
          total: p?.TotalAmount,
          currency: p?.CurrencyCode,
          base: p?.BaseAmount,
          discount: p?.DiscountAmount,
        },
      };
    });

    return NextResponse.json({
      success: true,
      count: hotels.length,
      searchId,
      hotels,
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
