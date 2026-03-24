import { NextRequest, NextResponse } from "next/server";
import { tour } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  try {
    const { packageId } = await req.json();

    if (!packageId) {
      return NextResponse.json({ error: "Package ID zorunludur" }, { status: 400 });
    }

    const result = await tour.getTourExtras({ PackageId: packageId });
    const data = result as any;
    const r = data?.Result;

    return NextResponse.json({
      success: true,
      extras: r?.Extras || r?.AdditionalServices || [],
      pickupPoints: r?.PickupPoints || [],
    });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json({ error: error.message, details: error.responseData }, { status: 500 });
    }
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 });
  }
}
