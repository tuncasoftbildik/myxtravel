import { NextRequest, NextResponse } from "next/server";
import { transfer } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickUp, dropOff, date, time, passengers = 1 } = body;

    if (!pickUp?.lat || !pickUp?.lng || !dropOff?.lat || !dropOff?.lng) {
      return NextResponse.json(
        { error: "Kalkış ve varış noktası zorunludur" },
        { status: 400 },
      );
    }
    if (!date || !time) {
      return NextResponse.json(
        { error: "Tarih ve saat zorunludur" },
        { status: 400 },
      );
    }

    const result = await transfer.searchTransfer({
      SearchType: "0",
      Paxes: [{ Count: String(passengers), PaxType: "0" }],
      Points: [
        {
          Date: `${date} ${time}`,
          PickUpPoint: {
            GeoLocation: { Latitude: pickUp.lat, Longitude: pickUp.lng },
          },
          DropOffPoint: {
            GeoLocation: { Latitude: dropOff.lat, Longitude: dropOff.lng },
          },
        },
      ],
    });

    const data = result as Record<string, unknown>;
    const resultData = data.Result as Record<string, unknown> | null;
    const searchResults =
      (resultData?.Results as Record<string, unknown>[]) ||
      (resultData?.SearchResult as Record<string, unknown>[]) ||
      [];

    const transfers = searchResults.map((item) => {
      const t = item.Transfer as Record<string, unknown>;
      const p = item.Price as Record<string, unknown>;
      const vehicle = t?.Vehicle as Record<string, unknown>;

      return {
        resultKey: item.ResultKey,
        name: t?.Name,
        vehicleName: vehicle?.Name,
        vehicleType: vehicle?.Type,
        vehicleClass: vehicle?.Class,
        vehicleCapacity: vehicle?.Capacity,
        vehicleImage: vehicle?.ImageUrl,
        provider: t?.Provider,
        duration: t?.Duration,
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
      count: transfers.length,
      transfers,
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
