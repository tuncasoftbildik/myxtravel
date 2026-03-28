import { NextResponse } from "next/server";
import { a2tour, Acente2Error } from "@/lib/acente2";

export async function GET() {
  try {
    const result = await a2tour.tourCategories();

    return NextResponse.json({
      success: true,
      categories: result?.result ?? [],
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
