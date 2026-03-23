import { travelrobotRequest } from "../client";

export async function searchTransfer(body: {
  Paxes: { Count: string; PaxType: string; ChildAgeList?: number[] }[];
  Points: {
    Date: string; // dd.MM.yyyy HH:mm
    PickUpPoint: { GeoLocation: { Latitude: number; Longitude: number }; PlaceId?: string };
    DropOffPoint: { GeoLocation: { Latitude: number; Longitude: number }; PlaceId?: string };
  }[];
  SearchType: string; // "0"=one-way, "1"=round-trip
}) {
  return travelrobotRequest({
    service: "Transfer",
    operation: "SearchTransfer",
    body: body as unknown as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function validateOffer(body: { Transfer: { ResultKey: string } }) {
  return travelrobotRequest({
    service: "Transfer",
    operation: "Validate",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getPaymentOptions(body: { ResultKeys: string[] }) {
  return travelrobotRequest({
    service: "Transfer",
    operation: "GetPaymentOptions",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function bookTransfer(body: Record<string, unknown>) {
  return travelrobotRequest({
    service: "Transfer",
    operation: "Book",
    body,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function getBooking(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Transfer",
    operation: "GetBooking",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}
