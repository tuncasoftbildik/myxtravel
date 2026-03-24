import { NextRequest, NextResponse } from "next/server";
import { tour } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  try {
    const { packageId, tourRooms } = await req.json();

    if (!packageId) {
      return NextResponse.json({ error: "Package ID zorunludur" }, { status: 400 });
    }

    const result = await tour.getTourFinalPrice({
      PackageId: packageId,
      ...(tourRooms ? { TourRooms: tourRooms } : {}),
    });

    const data = result as any;
    const r = data?.Result;

    return NextResponse.json({
      success: true,
      finalPrice: {
        total: r?.TotalPrice?.TotalAmount || r?.Price?.TotalAmount,
        currency: r?.TotalPrice?.CurrencyCode || r?.Price?.CurrencyCode,
        base: r?.TotalPrice?.BaseAmount || r?.Price?.BaseAmount,
        tax: r?.TotalPrice?.TaxAmount || r?.Price?.TaxAmount,
      },
      resultKey: r?.ResultKey || r?.Key,
      raw: r,
    });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json({ error: error.message, details: error.responseData }, { status: 500 });
    }
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 });
  }
}
