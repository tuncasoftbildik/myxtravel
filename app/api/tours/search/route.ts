import { NextRequest, NextResponse } from "next/server";
import { tour } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, endDate, searchType = 0, searchValues } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Başlangıç ve bitiş tarihi zorunludur" },
        { status: 400 },
      );
    }

    const result = await tour.searchTour({
      SearchType: searchType,
      StartDate: startDate,
      EndDate: endDate,
      ...(searchValues?.length ? { SearchValues: searchValues } : {}),
      AdvancedOptions: { Tour: { OnRequest: true } },
    });

    const data = result as Record<string, unknown>;
    const searchResult = (data.Result as Record<string, unknown>)?.SearchResult as Record<string, unknown>[] || [];

    // Normalize results for frontend
    const tours = searchResult.map((item) => {
      const t = item.Tour as Record<string, unknown>;
      const p = item.Price as Record<string, unknown>;
      const dates = item.Dates as Record<string, unknown>[];
      const dp = t.DeparturePoints as Record<string, unknown>;
      const categories = (t.Categories as Record<string, unknown>[]) || [];

      return {
        code: t.Code,
        groupCode: t.TourGroupCode,
        name: t.Name,
        shortDescription: t.ShortDescription,
        logo: t.Logo,
        dayCount: t.DayCount,
        nightCount: t.NightCount,
        rating: t.Rating,
        tourType: t.TourType,
        withTransfer: t.WithTransfer,
        languages: t.Languages,
        departurePoint: dp ? { code: dp.Code, name: dp.Name, country: dp.CountryName } : null,
        categories: categories.map((c) => ({
          code: c.Code,
          names: c.Names,
        })),
        price: {
          total: p.TotalAmount,
          currency: p.CurrencyCode,
          base: p.BaseAmount,
          discount: p.DiscountAmount,
        },
        dates: (dates || []).map((d) => ({
          tourCode: d.TourCode,
          startDate: d.StartDate,
          endDate: d.EndDate,
          allotment: d.Allotment,
          price: {
            total: (d.Price as Record<string, unknown>)?.TotalAmount,
            currency: (d.Price as Record<string, unknown>)?.CurrencyCode,
          },
        })),
      };
    });

    return NextResponse.json({
      success: true,
      count: tours.length,
      tours,
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
