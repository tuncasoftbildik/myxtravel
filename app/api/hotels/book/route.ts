import { NextRequest, NextResponse } from "next/server";
import { hotel as rhHotel, RatehawkError } from "@/lib/ratehawk";
import { getServiceSupabase } from "@/lib/supabase/service";
import type { HotelSupplier } from "@/lib/hotels";

/**
 * Book — step 3+4 of the RateHawk funnel (form + finish), fronted by
 * a Supabase row. Flow:
 *
 *   1. Insert hotel_orders row with status='pending' + our partner_order_id
 *   2. Call /hotel/order/booking/form/ (bookFormPartner)
 *   3. On success → status='form_submitted' → call /hotel/order/booking/finish/
 *   4. On success → status='confirmed' + supplier_order_id
 *
 * Phase 1 uses payment_type='hotel' only — guest pays at the property,
 * we carry zero payment risk. No PSP, no tokens, no charges.
 *
 * Every supplier response is saved to raw_response for audit/debug.
 */

interface BookBody {
  supplier?: HotelSupplier;
  bookHash?: string; // RH: the prebook-locked book_hash
  hotelCode?: string;
  hotelName?: string;
  roomName?: string;
  boardName?: string;
  checkIn?: string; // DD.MM.YYYY or YYYY-MM-DD
  checkOut?: string;
  nights?: number;
  adults?: number;
  childAges?: number[];
  total?: number;
  currency?: string;
  guest?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    tcNo?: string;
    notes?: string;
  };
}

function toIsoDate(d: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return d;
}

function genPartnerOrderId(): string {
  // Short, human-scannable id — "x-" prefix + timestamp + random suffix.
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `x-${ts}-${rnd}`;
}

export async function POST(req: NextRequest) {
  let orderId: string | null = null;
  const sb = getServiceSupabase();

  try {
    const body = (await req.json()) as BookBody;
    const {
      supplier = "travelrobot",
      bookHash,
      hotelCode,
      hotelName,
      roomName,
      boardName,
      checkIn,
      checkOut,
      nights,
      adults = 1,
      childAges = [],
      total,
      currency,
      guest,
    } = body;

    if (supplier !== "ratehawk") {
      return NextResponse.json(
        { error: "Bu tedarikçi için rezervasyon henüz desteklenmiyor" },
        { status: 501 },
      );
    }
    if (!bookHash || !hotelCode || !checkIn || !checkOut || !total || !currency || !guest) {
      return NextResponse.json({ error: "Eksik alanlar" }, { status: 400 });
    }
    if (!guest.firstName || !guest.lastName || !guest.email || !guest.phone) {
      return NextResponse.json({ error: "Misafir bilgileri eksik" }, { status: 400 });
    }

    const partnerOrderId = genPartnerOrderId();

    // 1) Insert pending order row
    const { data: inserted, error: insertErr } = await sb
      .from("hotel_orders")
      .insert({
        supplier,
        partner_order_id: partnerOrderId,
        book_hash: bookHash,
        hotel_code: hotelCode,
        hotel_name: hotelName || null,
        check_in: toIsoDate(checkIn),
        check_out: toIsoDate(checkOut),
        nights: nights || null,
        adults,
        child_ages: childAges,
        room_name: roomName || null,
        board_name: boardName || null,
        total,
        currency,
        payment_type: "hotel",
        guest_info: guest,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json(
        { error: "Sipariş kaydı oluşturulamadı", details: insertErr?.message },
        { status: 500 },
      );
    }
    orderId = inserted.id;

    // 2) bookFormPartner — one room with one lead guest (phase 1 scope)
    const formReq = {
      partner_order_id: partnerOrderId,
      book_hash: bookHash,
      language: "en",
      user_ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
      rooms: [
        {
          guests: [
            {
              first_name: guest.firstName,
              last_name: guest.lastName,
            },
          ],
        },
      ],
      payment_type: {
        type: "hotel",
        amount: String(total),
        currency_code: currency,
      },
    };

    const formRes = await rhHotel.bookFormPartner(formReq);

    await sb
      .from("hotel_orders")
      .update({
        status: "form_submitted",
        raw_request: formReq as unknown as Record<string, unknown>,
        raw_response: { form: formRes as Record<string, unknown> },
      })
      .eq("id", orderId);

    // 3) bookFinish — commit. Supplier may still reject at this stage.
    const finishRes = (await rhHotel.bookFinish(partnerOrderId)) as Record<string, unknown>;

    const supplierOrderId =
      (finishRes?.order_id as string) ||
      ((finishRes?.order as Record<string, unknown>)?.order_id as string) ||
      null;

    await sb
      .from("hotel_orders")
      .update({
        status: "confirmed",
        supplier_order_id: supplierOrderId,
        raw_response: { form: formRes as Record<string, unknown>, finish: finishRes },
      })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      orderId,
      partnerOrderId,
      supplierOrderId,
      status: "confirmed",
    });
  } catch (error) {
    const message =
      error instanceof RatehawkError
        ? `RateHawk: ${error.message}`
        : (error as Error).message;

    if (orderId) {
      await sb
        .from("hotel_orders")
        .update({
          status: "failed",
          error_message: message,
          raw_response: {
            error: message,
            details: error instanceof RatehawkError ? error.body : undefined,
          },
        })
        .eq("id", orderId);
    }

    return NextResponse.json(
      { error: "Rezervasyon tamamlanamadı", message },
      { status: 500 },
    );
  }
}
