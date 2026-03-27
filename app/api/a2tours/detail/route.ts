import { NextRequest, NextResponse } from "next/server";
import { a2tour, Acente2Error } from "@/lib/acente2";

export async function POST(req: NextRequest) {
  try {
    const { tourId } = await req.json();

    if (!tourId) {
      return NextResponse.json({ error: "tourId zorunludur" }, { status: 400 });
    }

    const result = await a2tour.getTourDetail(Number(tourId));

    return NextResponse.json({
      success: true,
      tour: result?.result ?? null,
    });
  } catch (error) {
    if (error instanceof Acente2Error) {
      return NextResponse.json(
        { error: error.message, details: error.responseData },
        { status: error.status || 500 },
      );
    }
    return NextResponse.json(
      { error: "Beklenmeyen hata oluştu" },
      { status: 500 },
    );
  }
}
