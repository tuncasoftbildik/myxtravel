import { travelrobotRequest } from "../client";

export async function getCurrencies() {
  return travelrobotRequest({
    service: "General",
    operation: "GetCurrencies",
    wrapper: "flat",
  });
}

export async function getCountries(culture = "tr") {
  return travelrobotRequest({
    service: "General",
    operation: "GetCountries",
    body: { culture },
    wrapper: "flat",
  });
}
