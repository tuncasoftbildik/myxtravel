import { travelrobotRequest } from "../client";

// Static Content API: ayrı sunucu (static.travelchain.online) ve JWT auth
// Şimdilik sandbox General API üzerinden countries/currencies alınabilir
// İleride ayrı client gerekecek

export async function getCountries() {
  return travelrobotRequest({
    service: "General",
    operation: "GetCountries",
    body: { culture: "tr" },
    wrapper: "flat",
  });
}

export async function getCurrencies() {
  return travelrobotRequest({
    service: "General",
    operation: "GetCurrencies",
    wrapper: "flat",
  });
}

// TODO: Static Content API (static.travelchain.online) entegrasyonu
// Ayrı credentials ve JWT Bearer auth gerekiyor
// Endpoints: /country/getCountries, /hotel/getDestinations,
// /hotel/getAllHotelCodes, /hotel/getHotelCodes, /hotel/getHotels
