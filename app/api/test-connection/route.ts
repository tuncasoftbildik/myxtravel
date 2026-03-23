import { NextResponse } from "next/server";
import { getToken, TravelrobotError } from "@/lib/travelrobot";
import { tour, general } from "@/lib/travelrobot";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    // 1. Token
    const tokenCode = await getToken();
    results.token = tokenCode.slice(0, 8) + "...";

    // 2. Countries
    try {
      const countries = await general.getCountries("tr") as Record<string, unknown>;
      results.countries = {
        success: !countries.HasError,
        count: countries.ResultCount,
        sample: ((countries.Result as Record<string, unknown>[]) || []).slice(0, 2).map((c) => c.Name),
      };
    } catch (e) {
      results.countries = { error: String(e) };
    }

    // 3. Currencies
    try {
      const currencies = await general.getCurrencies() as Record<string, unknown>;
      results.currencies = {
        success: !currencies.HasError,
        count: currencies.ResultCount,
      };
    } catch (e) {
      results.currencies = { error: String(e) };
    }

    // 4. Tour search
    try {
      const tours = await tour.searchTour({
        SearchType: 0,
        StartDate: "01.05.2026",
        EndDate: "01.07.2026",
      }) as Record<string, unknown>;
      const result = tours.Result as Record<string, unknown> | null;
      const searchResult = (result?.SearchResult as Record<string, unknown>[]) || [];
      results.tourSearch = {
        success: true,
        count: searchResult.length,
        sample: searchResult.slice(0, 2).map((t) => {
          const tourData = t.Tour as Record<string, unknown>;
          return tourData?.Name;
        }),
      };
    } catch (e) {
      results.tourSearch = { error: e instanceof TravelrobotError ? e.message : String(e) };
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof TravelrobotError ? error.message : String(error) },
      { status: 500 },
    );
  }
}
