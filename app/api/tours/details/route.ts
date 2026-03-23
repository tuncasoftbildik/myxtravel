import { NextRequest, NextResponse } from "next/server";
import { tour } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  try {
    const { tourCode } = await req.json();

    if (!tourCode) {
      return NextResponse.json({ error: "Tur kodu zorunludur" }, { status: 400 });
    }

    const result = await tour.getTourDetails({
      TourCode: tourCode,
      DetailTypes: [1, 2, 3, 4, 5],
      LanguageCode: "tr",
    });

    const data = result as any;
    const r = data?.Result;

    if (!r) {
      return NextResponse.json({ success: true, tour: null });
    }

    // Medias
    const medias = (r.Medias || []).map((m: any) => ({
      url: m.Url,
      title: m.Title,
      type: m.MediaType,
    }));

    // Programs
    const programs = (r.Programs || []).map((p: any) => ({
      day: p.Day || p.DayNo,
      title: p.Title || p.Name,
      description: p.Description || p.Content,
    }));

    // ExtraTours with inclusions/exclusions
    const extras = (r.ExtraTours || []).map((e: any) => ({
      code: e.ExtraTourCode,
      name: e.Name,
      inclusions: e.Program?.IncludedServices,
      exclusions: e.Program?.ExcludedServices,
      program: e.Program?.ProgramDetail,
    }));

    // Regions
    const regions = (r.Regions || []).map((reg: any) => ({
      city: reg.CityName,
      country: reg.CountryName,
      lat: reg.GeoLocation?.Latitude,
      lng: reg.GeoLocation?.Longitude,
    }));

    const tourData = {
      code: r.TourCode,
      groupCode: r.TourGroupCode,
      name: r.TourName,
      shortDescription: r.ShortDescription,
      logo: r.LogoUrl,
      dayCount: r.DayCount,
      nightCount: r.NightCount,
      startDate: r.StartDate,
      endDate: r.EndDate,
      withTransfer: r.WithTransfer,
      tourType: r.TourType,
      allotment: r.Allotment,
      medias,
      programs,
      extras,
      regions,
      cancellationPolicies: r.CancellationPolicies || [],
    };

    return NextResponse.json({ success: true, tour: tourData });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json(
        { error: error.message, details: error.responseData },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 });
  }
}
