/**
 * RateHawk certification test harness — runs the 4 mandatory booking
 * scenarios against sandbox end-to-end:
 *
 *   1. Multiroom  — hotel 10004834, 2 rooms (2a+1c[3], 2a+3c[1,5,17])
 *   2. Citizenship — hotel 10004834, residency=uz, 1 room 2a
 *   3. Children    — hotel 10004834, residency=mc, 1 room 2a+2c[0,17]
 *   4. Price change — hotel 8819557, expect ≈10% bump at prebook
 *
 * Output is consumable as an attachment for the RateHawk certification
 * email — each case logs the full search→HP→prebook→form→finish chain
 * with the locked amounts, supplier order ids, and the detected delta
 * for case 4.
 *
 * Run: npx tsx scripts/rh-cert-test.mts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const { hotel: rhHotel } = await import("../lib/ratehawk/index.ts");
const { ratehawkRequest } = await import("../lib/ratehawk/client.ts");
const { pollFinishStatus } = await import("../lib/ratehawk/services/hotel.ts");

type Guests = { adults: number; children: number[] };

interface CertCase {
  name: string;
  hid: number;
  residency: string;
  guests: Guests[];
  expectPriceChange?: boolean;
  /**
   * RH sandbox triggers error flows by partner_order_id SUFFIX:
   *   - unknown_success  → finish errors; status eventually ok
   *   - unknown_soldout  → finish errors; status eventually soldout
   *   - unknown_book_limit → finish errors; status eventually book_limit
   *   - soldout / book_limit → finish returns terminal directly
   */
  errorSuffix?: "unknown_success" | "unknown_soldout" | "unknown_book_limit" | "soldout" | "book_limit";
  expectStatus?: "success" | "soldout" | "book_limit";
}

const CHECK_IN = "2026-05-01";
const CHECK_OUT = "2026-05-03";
const CURRENCY = "EUR";
const LANGUAGE = "en";

const CASES: CertCase[] = [
  {
    name: "1. Multiroom (2 rooms, mixed children)",
    hid: 10004834,
    residency: "tr",
    guests: [
      { adults: 2, children: [3] },
      { adults: 2, children: [1, 5, 17] },
    ],
  },
  {
    name: "2. Citizenship — Uzbekistan (uz)",
    hid: 10004834,
    residency: "uz",
    guests: [{ adults: 2, children: [] }],
  },
  {
    name: "3. Children — Monaco (mc), ages 0+17",
    hid: 10004834,
    residency: "mc",
    guests: [{ adults: 2, children: [0, 17] }],
  },
  {
    name: "4. Price increase (~10%)",
    hid: 8819557,
    residency: "tr",
    guests: [{ adults: 2, children: [] }],
    expectPriceChange: true,
  },
  {
    name: "5. Unknown→success (finish errors, status ok)",
    hid: 10004834,
    residency: "tr",
    guests: [{ adults: 2, children: [] }],
    errorSuffix: "unknown_success",
    expectStatus: "success",
  },
  {
    name: "6. Unknown→soldout",
    hid: 10004834,
    residency: "tr",
    guests: [{ adults: 2, children: [] }],
    errorSuffix: "unknown_soldout",
    expectStatus: "soldout",
  },
  {
    name: "7. Unknown→book_limit",
    hid: 10004834,
    residency: "tr",
    guests: [{ adults: 2, children: [] }],
    errorSuffix: "unknown_book_limit",
    expectStatus: "book_limit",
  },
];

function log(section: string, msg: string) {
  console.log(`  [${section}] ${msg}`);
}

// RH rejects digits/symbols in guest names — use alpha-only placeholders.
const ADULT_NAMES = ["Alice", "Bob", "Carol", "David", "Eve", "Frank"];
function genGuestNames(guests: Guests[]) {
  return guests.map((g) => ({
    guests: Array.from({ length: g.adults }, (_, i) => ({
      first_name: ADULT_NAMES[i % ADULT_NAMES.length],
      last_name: "Tester",
    })),
  }));
}

async function runCase(c: CertCase, idx: number) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`CASE ${idx + 1}: ${c.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(
    `  hid=${c.hid} residency=${c.residency} rooms=${c.guests.length} guests=${JSON.stringify(c.guests)}`,
  );

  // Step 1: searchByHotels — find the slug id for hotelPage
  const serp = (await rhHotel.searchByHotels({
    hids: [c.hid],
    checkin: CHECK_IN,
    checkout: CHECK_OUT,
    residency: c.residency,
    language: LANGUAGE,
    guests: c.guests,
    currency: CURRENCY,
  })) as Record<string, unknown>;

  const serpHotels = (serp.hotels as Record<string, unknown>[]) || [];
  if (!serpHotels.length) {
    log("search", `❌ no hotels for hid=${c.hid}`);
    return { case: c.name, status: "failed", reason: "empty SERP" };
  }
  const slugId = serpHotels[0].id as string;
  const serpRates = (serpHotels[0].rates as Record<string, unknown>[]) || [];
  log("search", `✅ slug=${slugId}, rates=${serpRates.length}`);

  if (!serpRates.length) {
    return { case: c.name, status: "failed", reason: "no SERP rates" };
  }

  // Step 2: hotelPage — live rates for that specific config
  const hp = (await rhHotel.hotelPage({
    id: slugId,
    checkin: CHECK_IN,
    checkout: CHECK_OUT,
    residency: c.residency,
    language: LANGUAGE,
    guests: c.guests,
    currency: CURRENCY,
  })) as Record<string, unknown>;

  const hpHotels = (hp.hotels as Record<string, unknown>[]) || [];
  const hpRates = (hpHotels[0]?.rates as Record<string, unknown>[]) || [];
  if (!hpRates.length) {
    log("hp", `❌ no rates`);
    return { case: c.name, status: "failed", reason: "no HP rates" };
  }
  // Step 3: prebook — iterate HP rates until one locks (sandbox price-change
  // hotel returns rate_not_found for some rates; we want the first workable).
  let pbHash = "";
  let pbAmount = 0;
  let pbPt: Record<string, unknown> = {};
  let hpAmountUsed = 0;
  let prebookErr: unknown = null;
  const rateLimit = c.expectPriceChange ? hpRates.length : 3;
  for (let ri = 0; ri < Math.min(hpRates.length, rateLimit); ri++) {
    const hpRate = hpRates[ri];
    const hpHash = hpRate.book_hash as string;
    const hpPt =
      ((hpRate.payment_options as Record<string, unknown>)?.payment_types as Record<
        string,
        unknown
      >[])?.[0] || {};
    const hpAmount = parseFloat(
      (hpPt.show_amount as string) || (hpPt.amount as string) || "0",
    );
    try {
      const pb = (await ratehawkRequest<unknown>({
        path: "/hotel/prebook/",
        body: { hash: hpHash, price_increase_percent: 100 },
      })) as Record<string, unknown>;
      const pbRate =
        (((pb.hotels as Record<string, unknown>[])?.[0]?.rates as Record<string, unknown>[]) ||
          [])[0];
      if (!pbRate) throw new Error("no prebook rate");
      pbHash = pbRate.book_hash as string;
      pbPt =
        (((pbRate.payment_options as Record<string, unknown>)?.payment_types as Record<
          string,
          unknown
        >[]) || [])[0] || {};
      pbAmount = parseFloat((pbPt.show_amount as string) || (pbPt.amount as string) || "0");
      hpAmountUsed = hpAmount;
      const delta = hpAmount ? ((pbAmount - hpAmount) / hpAmount) * 100 : 0;
      log(
        "prebook",
        `✅ rate[${ri}] hash=${pbHash.slice(0, 16)}... amount=${pbAmount} ${pbPt.currency_code} (Δ ${delta.toFixed(1)}% vs HP ${hpAmount})`,
      );
      prebookErr = null;
      break;
    } catch (err) {
      prebookErr = err;
      const e = err as { status?: number; body?: unknown };
      const body = (e.body as Record<string, unknown>) || {};
      const errCode = body.error as string;
      log("prebook", `  rate[${ri}] ❌ ${errCode || e.status}`);
    }
  }
  if (prebookErr) {
    const e = prebookErr as { message?: string };
    return { case: c.name, status: "failed", reason: `prebook: ${e.message}` };
  }
  if (c.expectPriceChange) {
    const delta = hpAmountUsed ? ((pbAmount - hpAmountUsed) / hpAmountUsed) * 100 : 0;
    if (Math.abs(delta) < 1) {
      log("prebook", `⚠️  expected ~10% change, got ${delta.toFixed(1)}%`);
    } else {
      log("prebook", `✅ price change detected: ${delta.toFixed(1)}%`);
    }
  }

  // Step 4: bookFormPartner. RH sandbox triggers error flows via the
  // partner_order_id SUFFIX — must literally end with the magic keyword.
  const suffix = c.errorSuffix ? `-${c.errorSuffix}` : "";
  const partnerOrderId = `x-cert${idx + 1}-${Date.now().toString(36)}${suffix}`;
  const roomsPayload = genGuestNames(c.guests);
  const paymentType = {
    type: pbPt.type as string,
    amount: pbPt.amount as string,
    currency_code: pbPt.currency_code as string,
  };

  try {
    await ratehawkRequest<unknown>({
      path: "/hotel/order/booking/form/",
      body: {
        partner_order_id: partnerOrderId,
        book_hash: pbHash,
        language: LANGUAGE,
        user_ip: "127.0.0.1",
        rooms: roomsPayload,
        payment_type: paymentType,
      },
    });
    log("form", `✅ partner_order_id=${partnerOrderId}`);
  } catch (err) {
    const e = err as { status?: number; body?: unknown };
    log("form", `❌ ${e.status || ""} ${JSON.stringify(e.body).slice(0, 400)}`);
    return { case: c.name, status: "failed", reason: "form rejected" };
  }

  // Step 5: bookFinish — may throw for unknown_* cases (expected); we
  // still proceed to poll /finish/status/ because the order commits
  // asynchronously per RH contract.
  let finishErrored = false;
  try {
    const finishRes = (await ratehawkRequest<unknown>({
      path: "/hotel/order/booking/finish/",
      body: {
        partner: { partner_order_id: partnerOrderId },
        language: LANGUAGE,
        user_ip: "127.0.0.1",
        rooms: roomsPayload,
        payment_type: paymentType,
        user: {
          email: "cert@xturizm.com",
          phone: "+905436262496",
          comment: "",
        },
      },
    })) as Record<string, unknown>;
    void finishRes;
    log("finish", `✅ acknowledged`);
  } catch (err) {
    finishErrored = true;
    const e = err as { status?: number; body?: unknown; message?: string };
    const errBody = (e.body as Record<string, unknown>) || {};
    log("finish", `⚠️  errored (${errBody.error || e.message}) — still polling per RH contract`);
  }

  log("finish", `→ polling /finish/status/`);
  const poll = await pollFinishStatus(partnerOrderId, {
    maxAttempts: 45,
    intervalMs: 2000,
    onTick: (a, p) => log("status", `  attempt ${a}: percent=${p}`),
  });
  const supplierOrderId =
    (((poll.response as Record<string, unknown>)?.order as Record<string, unknown>)
      ?.order_id as string) ||
    ((poll.response as Record<string, unknown>)?.order_id as string) ||
    null;
  log(
    "status",
    `→ ${poll.status} (${poll.attempts} attempts)${supplierOrderId ? ` order_id=${supplierOrderId}` : ""}`,
  );

  if (c.expectStatus) {
    if (poll.status === c.expectStatus) {
      log("assert", `✅ expected status=${c.expectStatus} matched`);
    } else {
      log("assert", `❌ expected status=${c.expectStatus}, got ${poll.status}`);
    }
  }
  if (!["success", "soldout", "book_limit"].includes(poll.status)) {
    log("status", `dump: ${JSON.stringify(poll.response).slice(0, 400)}`);
  }
  return {
    case: c.name,
    status: poll.status,
    finishErrored,
    expected: c.expectStatus || "success",
    partnerOrderId,
    supplierOrderId,
    amount: pbAmount,
    currency: pbPt.currency_code,
  };
}

const only = process.argv[2] ? parseInt(process.argv[2], 10) - 1 : -1;
const results: unknown[] = [];
for (let i = 0; i < CASES.length; i++) {
  if (only >= 0 && i !== only) continue;
  try {
    results.push(await runCase(CASES[i], i));
  } catch (err) {
    const e = err as { status?: number; body?: unknown; message?: string };
    console.log(`  [fatal] ❌ ${e.status || ""} ${e.message}`);
    console.log(`  ${JSON.stringify(e.body).slice(0, 500)}`);
    results.push({ case: CASES[i].name, status: "fatal", reason: e.message });
  }
}

console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`SUMMARY`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
for (const r of results) console.log(JSON.stringify(r));
