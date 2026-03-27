import { NextRequest, NextResponse } from "next/server";
import { a2tour, Acente2Error } from "@/lib/acente2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tourId, date, adults = 2, child1 = 0, child2 = 0 } = body;

    if (!tourId || !date) {
      return NextResponse.json({ error: "tourId ve date zorunludur" }, { status: 400 });
    }

    const result = await a2tour.calculateTourPrice({
      TourID: Number(tourId),
      date,
      roomCount: 1,
      rooms: [
        {
          adults: Number(adults),
          child1: Number(child1),
          child2: Number(child2),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      price: result?.result ?? null,
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
