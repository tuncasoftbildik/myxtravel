import { travelrobotRequest } from "../client";

// Air API: wrapper="request", tokenStyle="nested" for search/validate
// tokenStyle="direct" for fare rules, payment, booking, retrieve etc.

export async function searchAvailability(body: {
  SearchType: string;
  Legs: {
    DeparturePoint: { Code: string; HotpointType: string };
    ArrivalPoint: { Code: string; HotpointType: string };
    Date: string; // dd.MM.yyyy
  }[];
  Passengers: { Count: string; PaxType: string }[];
  AdvancedOptions?: Record<string, unknown>;
}) {
  return travelrobotRequest({
    service: "Air",
    operation: "SearchAvailability",
    body: body as unknown as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getFareRules(body: { ResultKeys: string[] }) {
  return travelrobotRequest({
    service: "Air",
    operation: "GetFareRules",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function getBrandedFares(body: { FareAlternativeLegKeys: string[] }) {
  return travelrobotRequest({
    service: "Air",
    operation: "GetBrandedFares",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function validate(body: { Air: { FareAlternativeLegKeys: string[] } }) {
  return travelrobotRequest({
    service: "Air",
    operation: "Validate",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getPaymentOptions(body: { ResultKeys: string[] }) {
  return travelrobotRequest({
    service: "Air",
    operation: "GetPaymentOptions",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function bookFlight(body: Record<string, unknown>) {
  return travelrobotRequest({
    service: "Air",
    operation: "Book",
    body,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function retrieveReservation(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Air",
    operation: "RetrieveReservation",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function reservationToTicket(body: Record<string, unknown>) {
  return travelrobotRequest({
    service: "Air",
    operation: "ReservationToTicket",
    body,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function cancelReservation(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Air",
    operation: "CancelReservation",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function voidTicket(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Air",
    operation: "Void",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function getBooking(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Air",
    operation: "GetBooking",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}
