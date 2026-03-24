import { NextRequest, NextResponse } from "next/server";
import { tour } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packageId, passengers, contactInfo, paymentInfo } = body;

    if (!packageId || !passengers?.length || !contactInfo) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const result = await tour.bookTour({
      PackageId: packageId,
      Passengers: passengers,
      ContactInfo: contactInfo,
      PaymentInfo: paymentInfo || { PaymentType: "CurrentPayment" },
    });

    const data = result as any;
    const r = data?.Result;

    return NextResponse.json({
      success: !data?.HasError,
      booking: {
        systemPnr: r?.SystemPnr || r?.PNR,
        status: r?.Status || r?.BookingStatus,
        message: r?.Message,
      },
      error: data?.HasError ? (data?.ErrorMessage || "Rezervasyon başarısız") : null,
      raw: r,
    });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json({ error: error.message, details: error.responseData }, { status: 500 });
    }
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 });
  }
}
