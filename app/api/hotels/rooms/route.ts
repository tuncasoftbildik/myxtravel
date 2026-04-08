import { NextRequest, NextResponse } from "next/server";
import { hotel as trHotel } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";
import { hotel as rhHotel, RatehawkError } from "@/lib/ratehawk";
import type { HotelSupplier } from "@/lib/hotels";

/**
 * Rooms/rates lookup for a specific hotel. Supplier-aware: callers should
 * pass `supplier` ("travelrobot" | "ratehawk") along with the supplier-native
 * `productCode` (HotelCode or RateHawk hid). For backward compatibility,
 * supplier defaults to "travelrobot".
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productCode,
      checkIn,
      checkOut,
      adults = 2,
      childAges = [],
      nationality = "TR",
      currency = "EUR",
      supplier = "travelrobot",
    } = body as {
      productCode?: string;
      checkIn?: string;
      checkOut?: string;
      adults?: number;
      childAges?: number[];
      nationality?: string;
      currency?: string;
      supplier?: HotelSupplier;
    };

    if (!productCode || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "productCode, checkIn, checkOut zorunludur" },
        { status: 400 },
      );
    }

    if (supplier === "ratehawk") {
      return handleRatehawk({
        productCode,
        checkIn,
        checkOut,
        adults,
        childAges,
        nationality,
        currency,
      });
    }

    return handleTravelrobot({ productCode, checkIn, checkOut, adults });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof RatehawkError) {
      return NextResponse.json({ error: error.message, status: error.status }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Beklenmeyen hata oluştu", message: (error as Error).message },
      { status: 500 },
    );
  }
}

async function handleTravelrobot({
  productCode,
  checkIn,
  checkOut,
  adults,
}: {
  productCode: string;
  checkIn: string;
  checkOut: string;
  adults: number;
}) {
  const paxes = [{ Count: adults, PaxType: 0 }];
  const searchResult = await trHotel.searchHotel({
    CheckInDate: checkIn,
    CheckOutDate: checkOut,
    NationalityCode: "TR",
    Rooms: [{ Paxes: paxes }],
    ShowMultipleRate: "true",
    Hotels: [{ HotelCode: productCode }],
  });

  const data = searchResult as Record<string, unknown>;
  const resultData = data.Result as Record<string, unknown> | null;
  const hotels = (resultData?.Hotels as Record<string, unknown>[]) || [];
  if (hotels.length === 0) {
    return NextResponse.json({ success: true, supplier: "travelrobot", rooms: [] });
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
        cancellationPolicies: ((alt.CancellationPolicies as Record<string, unknown>[]) || []).map(
          (cp: Record<string, unknown>) => ({
            description: cp.PolicyDescription || "",
            penaltyAmount: cp.PenaltyAmount || 0,
            currency: cp.CurrencyCode || "TRY",
          }),
        ),
      })),
    };
  });

  return NextResponse.json({ success: true, supplier: "travelrobot", rooms });
}

async function handleRatehawk({
  productCode,
  checkIn,
  checkOut,
  adults,
  childAges,
  nationality,
  currency,
}: {
  productCode: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  childAges: number[];
  nationality: string;
  currency: string;
}) {
  const res = await rhHotel.hotelPage({
    id: productCode,
    checkin: checkIn,
    checkout: checkOut,
    residency: nationality.toLowerCase(),
    language: "en",
    guests: [{ adults, children: childAges }],
    currency,
  });

  const hotels = res?.hotels || [];
  if (hotels.length === 0) {
    return NextResponse.json({ success: true, supplier: "ratehawk", rooms: [] });
  }

  const rates = hotels[0].rates || [];

  const alternatives = rates.map((rate) => {
    const pt = rate.payment_options?.payment_types?.[0];
    const total = parseFloat(pt?.show_amount || pt?.amount || "0") || 0;
    const curr = pt?.show_currency_code || pt?.currency_code || currency;

    return {
      roomCode: rate.book_hash,
      roomName: rate.room_data_trans?.main_name || rate.room_name || "",
      boardCode: rate.meal || "",
      boardName: rate.meal_data?.value || rate.meal || "",
      totalAmount: total,
      baseAmount: total,
      discountAmount: 0,
      currency: curr,
      allotment: 0,
      cancellationPolicies: [], // RH exposes these at prebook, not at SERP
    };
  });

  return NextResponse.json({
    success: true,
    supplier: "ratehawk",
    rooms: [{ roomIndex: 0, alternatives }],
  });
}
