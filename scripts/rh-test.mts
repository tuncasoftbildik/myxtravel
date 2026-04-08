import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

// Use relative imports — aggregator uses @/... aliases that tsx can't resolve
// without tsconfig paths plugin. Test the raw ratehawk + normalize path.
const { hotel: rhHotel, rhImage } = await import("../lib/ratehawk/index.ts");
const { normalizeRatehawkHotel } = await import("../lib/hotels/normalize/ratehawk.ts");

const res = await rhHotel.searchByHotels({
  checkin: "2026-05-15",
  checkout: "2026-05-18",
  residency: "tr",
  language: "en",
  guests: [{ adults: 2, children: [] }],
  hids: [10595223, 10004834, 8819557],
  currency: "EUR",
});
const rawHotels = res?.hotels ?? [];
console.log("raw hotels:", rawHotels.length);

const infoMap = await rhHotel.hotelInfoBatch(rawHotels.map((h) => h.id));
console.log("info cached:", infoMap.size);

for (const h of rawHotels) {
  const info = infoMap.get(h.id);
  const meta = info
    ? {
        name: info.name,
        stars: info.star_rating,
        thumbnail: info.images?.[0] ? rhImage(info.images[0], "640x400") : null,
        address: info.address || null,
        city: info.region?.name || null,
        country: info.region?.country_code || null,
        location: { lat: info.latitude, lng: info.longitude },
      }
    : undefined;
  const unified = normalizeRatehawkHotel(h, meta);
  if (!unified) continue;
  console.log(
    `- ${unified.name} [${unified.stars}★] ${unified.city}, ${unified.country} — ${unified.price.total.toFixed(2)} ${unified.price.currency}`,
  );
  console.log(`  thumb: ${unified.thumbnail?.slice(0, 90)}`);
}
