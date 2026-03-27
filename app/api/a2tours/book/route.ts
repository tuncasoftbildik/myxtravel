import { NextRequest, NextResponse } from "next/server";
import { a2tour, Acente2Error } from "@/lib/acente2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchToken, passengers, contactPhone, contactEmail, note } = body;

    if (!searchToken || !passengers?.length || !contactPhone || !contactEmail) {
      return NextResponse.json(
        { error: "searchToken, passengers, contactPhone ve contactEmail zorunludur" },
        { status: 400 },
      );
    }

    const result = await a2tour.addSale({
      searchToken,
      passengers,
      contactPhone,
      contactEmail,
      note,
    });

    return NextResponse.json({
      success: true,
      sale: result?.result ?? null,
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
