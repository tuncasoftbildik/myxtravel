import { NextResponse } from "next/server";
import { a2tour, Acente2Error } from "@/lib/acente2";

export async function GET() {
  try {
    const result = await a2tour.getTourList();
    // API returns { result: { list: [...] } }
    const raw = result?.result as unknown as Record<string, unknown>;
    const tours = ((raw?.list ?? raw) || []) as Record<string, unknown>[];

    return NextResponse.json(
      { success: true, count: tours.length, tours },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" } },
    );
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
