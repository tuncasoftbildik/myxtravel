import { NextRequest, NextResponse } from "next/server";
import { tour } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  try {
    const { tourAlternativeCode, adults = 2, children = 0 } = await req.json();

    if (!tourAlternativeCode) {
      return NextResponse.json({ error: "Tur kodu zorunludur" }, { status: 400 });
    }

    const paxes: { PaxType: number; Count: number }[] = [];
    if (adults > 0) paxes.push({ PaxType: 0, Count: adults });
    if (children > 0) paxes.push({ PaxType: 1, Count: children });

    const result = await tour.getTourPrices({
      TourAlternativeCode: tourAlternativeCode,
      Rooms: [{ Index: 1, Paxes: paxes }],
    });

    const data = result as any;
    const r = data?.Result;

    const packages = (r?.PackagePrices || []).map((pkg: any) => ({
      packageId: pkg.PackageId,
      price: {
        total: pkg.Price?.TotalAmount,
        currency: pkg.Price?.CurrencyCode,
        base: pkg.Price?.BaseAmount,
        tax: pkg.Price?.TaxAmount,
        discount: pkg.Price?.DiscountAmount,
      },
      accommodations: pkg.Accommodations,
      approvalType: pkg.ApprovalType,
    }));

    const tourInfo = r?.TourInfo
      ? {
          code: r.TourInfo.Code,
          name: r.TourInfo.Name,
          dayCount: r.TourInfo.DayCount,
          nightCount: r.TourInfo.NightCount,
          allotment: r.TourInfo.Allotment,
          startDate: r.TourInfo.StartDate,
          endDate: r.TourInfo.EndDate,
          departurePoints: r.TourInfo.DeparturePoints,
          cruiseName: r.TourInfo.CruiseName,
          cruiseCompany: r.TourInfo.CruiseCompanyName,
        }
      : null;

    return NextResponse.json({ success: true, packages, tourInfo });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json({ error: error.message, details: error.responseData }, { status: 500 });
    }
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 });
  }
}
