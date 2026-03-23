import { NextRequest, NextResponse } from "next/server";
import { air } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, departDate, returnDate, passengers = 1, tripType = "oneway" } = body;

    if (!from || !to || !departDate) {
      return NextResponse.json(
        { error: "Kalkış, varış ve tarih zorunludur" },
        { status: 400 },
      );
    }

    const legs = [
      {
        DeparturePoint: { Code: from, HotpointType: "3" },
        ArrivalPoint: { Code: to, HotpointType: "3" },
        Date: departDate,
      },
    ];

    if (tripType === "roundtrip" && returnDate) {
      legs.push({
        DeparturePoint: { Code: to, HotpointType: "3" },
        ArrivalPoint: { Code: from, HotpointType: "3" },
        Date: returnDate,
      });
    }

    const result = await air.searchAvailability({
      SearchType: tripType === "roundtrip" ? "1" : "0",
      Legs: legs,
      Passengers: [{ Count: String(passengers), PaxType: "0" }],
    });

    const data = result as any;
    const searchResults = data?.Result?.SearchResults || [];

    // Flatten: each Result has Legs (with AlternativeLegs->Segments) and Fares (with TotalPrice)
    const flights: any[] = [];

    for (const group of searchResults) {
      for (const result of group.Results || []) {
        const resultLegs = result.Legs || [];

        // Parse legs from AlternativeLegs -> Segments
        const parsedLegs = resultLegs.map((leg: any) => {
          const altLegs = leg.AlternativeLegs || [];
          // Take first alternative
          const alt = altLegs[0];
          if (!alt) return null;

          const segments = (alt.Segments || []).map((seg: any) => ({
            airline: seg.OperatingAirline?.Name || seg.TicketingAirline?.Name,
            airlineCode: seg.OperatingAirline?.Code || seg.TicketingAirline?.Code,
            airlineLogo: seg.OperatingAirline?.Logo || seg.TicketingAirline?.Logo,
            flightNumber: seg.FlightNo,
            departureCode: seg.DepartureAirport?.Code,
            departureName: seg.DepartureAirport?.CityName,
            arrivalCode: seg.ArrivalAirport?.Code,
            arrivalName: seg.ArrivalAirport?.CityName,
            departureDate: seg.DepartureDate,
            arrivalDate: seg.ArrivalDate,
            duration: seg.FlightDuration,
            equipment: seg.Equipment?.Value,
          }));

          const firstSeg = segments[0];
          const lastSeg = segments[segments.length - 1];

          return {
            departureCode: firstSeg?.departureCode,
            departureName: firstSeg?.departureName,
            arrivalCode: lastSeg?.arrivalCode,
            arrivalName: lastSeg?.arrivalName,
            departureDate: firstSeg?.departureDate,
            arrivalDate: lastSeg?.arrivalDate,
            segments,
          };
        }).filter(Boolean);

        // Each fare is a price option for this flight
        for (const fare of result.Fares || []) {
          const tp = fare.TotalPrice;
          const fareLegs = fare.FareAlternativeLegs || [];

          flights.push({
            key: fareLegs[0]?.Key,
            fareTitle: fare.Title,
            legs: parsedLegs,
            price: {
              total: tp?.TotalAmount,
              currency: tp?.CurrencyCode,
              base: tp?.BaseAmount,
              tax: tp?.TaxAmount,
              discount: tp?.DiscountAmount,
            },
            isCharter: result.IsCharter,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: flights.length,
      flights,
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
