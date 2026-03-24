import { NextRequest, NextResponse } from "next/server";
import { tour } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  try {
    const { resultKeys } = await req.json();

    if (!resultKeys?.length) {
      return NextResponse.json({ error: "Result keys zorunludur" }, { status: 400 });
    }

    const result = await tour.getPaymentOptions({ ResultKeys: resultKeys });
    const data = result as any;
    const r = data?.Result;

    const options = (r?.PaymentOptions || r || []).map?.((opt: any) => ({
      type: opt.PaymentType,
      name: opt.PaymentTypeName || opt.Name,
      installments: (opt.Installments || []).map((inst: any) => ({
        count: inst.InstallmentCount,
        amount: inst.Amount,
        totalAmount: inst.TotalAmount,
        currency: inst.CurrencyCode,
      })),
    })) || [];

    return NextResponse.json({ success: true, paymentOptions: options, raw: r });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json({ error: error.message, details: error.responseData }, { status: 500 });
    }
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 });
  }
}
