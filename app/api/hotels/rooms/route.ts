import { NextRequest, NextResponse } from "next/server";
import { hotel } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

export async function POST(req: NextRequest) {
  try {
    const { productCode, checkIn, checkOut, adults = 2 } = await req.json();
    if (!productCode || !checkIn || !checkOut) {
      return NextResponse.json({ error: "productCode, checkIn, checkOut zorunludur" }, { status: 400 });
    }

    // Do a fresh search for this specific hotel to get current room prices
    const paxes = [{ Count: adults as number, PaxType: 0 }];
    const searchResult = await hotel.searchHotel({
      CheckInDate: checkIn,
      CheckOutDate: checkOut,
      NationalityCode: "TR",
      Rooms: [{ Paxes: paxes }],
      ShowMultipleRate: "true", // Get all room alternatives
      Hotels: [{ HotelCode: productCode }],
    });

    const data = searchResult as Record<string, unknown>;
    const resultData = data.Result as Record<string, unknown> | null;
    const hotels = (resultData?.Hotels as Record<string, unknown>[]) || [];

    if (hotels.length === 0) {
      return NextResponse.json({ success: true, rooms: [] });
    }

    const hotelResult = hotels[0];
    const roomList = (hotelResult.Rooms as Record<string, unknown>[]) || [];

    const rooms = roomList.map((room) => {
      const alts = (room.RoomAlternatives as Record<string, unknown>[]) || [];
      return {
        roomIndex: room.RoomIndex || room.Index,
        alternatives: alts.map((alt) => ({
          roomCode: alt.RoomCode || "",
          roomName: alt.RoomName || "",
          boardCode: alt.BoardCode || "",
          boardName: alt.BoardName || "",
          totalAmount: alt.TotalAmount || 0,
          baseAmount: alt.BaseAmount || 0,
          discountAmount: alt.DiscountAmount || 0,
          currency: alt.CurrencyCode || "TRY",
          allotment: alt.Allotment || 0,
          cancellationPolicies: ((alt.CancellationPolicies as Record<string, unknown>[]) || []).map((cp: Record<string, unknown>) => ({
            description: cp.PolicyDescription || "",
            penaltyAmount: cp.PenaltyAmount || 0,
            currency: cp.CurrencyCode || "TRY",
          })),
        })),
      };
    });

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 });
  }
}
