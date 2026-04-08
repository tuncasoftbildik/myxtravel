import { NextRequest, NextResponse } from "next/server";
import { hotel as rhHotel, RatehawkError } from "@/lib/ratehawk";
import type { HotelSupplier } from "@/lib/hotels";

/**
 * Prebook — step 2 of the RateHawk booking funnel. Locks the rate,
 * returns the finalized price and cancellation policies. Client should
 * show these before collecting payment; if `priceChanged` is true the
 * user MUST re-confirm (certification requirement).
 *
 * TravelRobot path is stubbed — TR hotel booking is out of scope for
 * this project (TR is only serving tours in production).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      supplier?: HotelSupplier;
      rateToken?: string; // RH: book_hash
      expectedAmount?: number; // client's previously shown price
      expectedCurrency?: string;
    };
    const { supplier = "travelrobot", rateToken, expectedAmount, expectedCurrency } = body;

    if (!rateToken) {
      return NextResponse.json({ error: "rateToken zorunludur" }, { status: 400 });
    }

    if (supplier !== "ratehawk") {
      return NextResponse.json(
        { error: "Bu tedarikçi için prebook henüz desteklenmiyor" },
        { status: 501 },
      );
    }

    const res = (await rhHotel.prebook({ book_hash: rateToken })) as Record<string, unknown>;

    // RateHawk wraps data behind `data.hotels[0].rates[0]` in the envelope
    // (ratehawkRequest already unwraps the outer {status, data, error}).
    const hotels = (res?.hotels as Record<string, unknown>[]) || [];
    const rate =
      ((hotels[0]?.rates as Record<string, unknown>[]) || [])[0] ||
      (res?.rate as Record<string, unknown>) ||
      null;

    if (!rate) {
      return NextResponse.json(
        { error: "Oda artık müsait değil", code: "rate_unavailable" },
        { status: 409 },
      );
    }

    const paymentOptions = rate.payment_options as Record<string, unknown> | undefined;
    const paymentTypes =
      (paymentOptions?.payment_types as Record<string, unknown>[]) || [];
    const pt = paymentTypes[0] || {};

    const total = parseFloat((pt.show_amount as string) || (pt.amount as string) || "0") || 0;
    const currency =
      (pt.show_currency_code as string) || (pt.currency_code as string) || "EUR";
    const freshBookHash =
      (rate.book_hash as string) || rateToken; // RH may issue a new hash

    // Cancellation policies — RH nests these inside payment_types[n].cancellation_penalties
    const penalties = (pt.cancellation_penalties as Record<string, unknown>) || {};
    const policies = ((penalties.policies as Record<string, unknown>[]) || []).map((p) => ({
      startAt: (p.start_at as string) || null,
      endAt: (p.end_at as string) || null,
      amountShow: (p.amount_show as string) || (p.amount_charge as string) || "0",
      currency: (p.currency_code as string) || currency,
    }));
    const freeCancellationBefore = (penalties.free_cancellation_before as string) || null;

    const priceChanged =
      typeof expectedAmount === "number" &&
      expectedAmount > 0 &&
      Math.abs(expectedAmount - total) > 0.01 &&
      (!expectedCurrency || expectedCurrency === currency);

    return NextResponse.json({
      success: true,
      supplier: "ratehawk",
      bookHash: freshBookHash,
      total,
      currency,
      priceChanged,
      previousTotal: expectedAmount ?? null,
      freeCancellationBefore,
      cancellationPolicies: policies,
      paymentType: (pt.type as string) || "deposit",
    });
  } catch (error) {
    if (error instanceof RatehawkError) {
      return NextResponse.json(
        { error: error.message, status: error.status, details: error.body },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Beklenmeyen hata oluştu", message: (error as Error).message },
      { status: 500 },
    );
  }
}
