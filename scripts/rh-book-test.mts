import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const { hotel: rhHotel } = await import("../lib/ratehawk/index.ts");
const { ratehawkRequest } = await import("../lib/ratehawk/client.ts");

const hp = (await rhHotel.hotelPage({
  id: "conrad_los_angeles",
  checkin: "2026-04-09",
  checkout: "2026-04-11",
  residency: "tr",
  language: "en",
  guests: [{ adults: 2, children: [] }],
  currency: "EUR",
})) as Record<string, unknown>;

const rate = ((hp.hotels as any[])[0].rates as any[])[0];
console.log("SERP book_hash:", rate.book_hash);

const pb = (await ratehawkRequest<any>({
  path: "/hotel/prebook/",
  body: { hash: rate.book_hash },
})) as Record<string, unknown>;

const pbRate = ((pb.hotels as any[])[0].rates as any[])[0];
const pbHash = pbRate.book_hash as string;
const pt = pbRate.payment_options.payment_types[0];
console.log("prebook hash:", pbHash);
console.log("locked amount:", pt.amount, pt.currency_code);

// Now book — form then finish
const partnerOrderId = `x-test-${Date.now().toString(36)}`;
const formBody = {
  partner_order_id: partnerOrderId,
  book_hash: pbHash,
  language: "en",
  user_ip: "127.0.0.1",
  rooms: [{ guests: [{ first_name: "Test", last_name: "Guest" }] }],
  payment_type: {
    type: "hotel",
    amount: pt.amount,
    currency_code: pt.currency_code,
  },
};

console.log("\n[form]");
try {
  const formRes = await ratehawkRequest<unknown>({
    path: "/hotel/order/booking/form/",
    body: formBody,
  });
  console.log("  ✅", JSON.stringify(formRes).slice(0, 400));
} catch (err) {
  const e = err as any;
  console.log("  ❌", e.status, JSON.stringify(e.body?.debug?.validation_error || e.body).slice(0, 400));
  process.exit(1);
}

console.log("\n[finish]");
try {
  const finishRes = await ratehawkRequest<unknown>({
    path: "/hotel/order/booking/finish/",
    body: {
      partner: { partner_order_id: partnerOrderId },
      language: "en",
      user_ip: "127.0.0.1",
      rooms: [{ guests: [{ first_name: "Test", last_name: "Guest" }] }],
      payment_type: {
        type: "deposit",
        amount: "354.00",
        currency_code: "USD",
      },
      user: {
        email: "test@example.com",
        phone: "+905436262496",
        comment: "",
      },
    },
  });
  console.log("  ✅", JSON.stringify(finishRes).slice(0, 600));
} catch (err) {
  const e = err as any;
  console.log("  ❌", e.status, JSON.stringify(e.body, null, 2));
}
