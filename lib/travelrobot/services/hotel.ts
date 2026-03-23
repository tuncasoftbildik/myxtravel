import { travelrobotRequest } from "../client";

// SearchHotel uses "filter" wrapper, everything else uses "request"

export async function searchHotel(body: {
  CheckInDate: string;  // dd.MM.yyyy
  CheckOutDate: string; // dd.MM.yyyy
  NationalityCode: string;
  Rooms: { Paxes: { Count: number; PaxType: number; ChildAgeList?: number[] }[] }[];
  ShowMultipleRate: string;
  Destinations?: { DestinationId: number }[];
  Hotels?: { HotelCode: string }[];
  AdvancedOptions?: Record<string, unknown>;
  Markup?: Record<string, unknown>;
}) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "SearchHotel",
    body: body as unknown as Record<string, unknown>,
    wrapper: "filter",
    tokenStyle: "nested",
  });
}

export async function getAsyncResults(body: { SearchId: string; ReturnNewResult: string }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "GetAsyncHotels",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getRoomOffers(body: { ProductCode: string; SearchKey: string; LanguageCode?: string }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "GetHotelRoomPrices",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function getHotelDetails(body: { ProductCode: string }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "GetHotelDetails",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function getRoomCancellationPolicies(body: { ResultKeys: string[] }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "GetHotelRoomCancellationPolicies",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function getRoomRemarks(body: { ResultKeys: string[] }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "GetHotelRoomRemarks",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function validateHotelRooms(body: {
  Hotel: { Rooms: { Key: string; Paxes?: Record<string, unknown>[]; AdditionalServices?: Record<string, unknown>[] }[] };
}) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "ValidateHotelRoomsV2",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getPaymentOptions(body: { ResultKeys: string[] }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "GetPaymentOptions",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function bookHotel(body: Record<string, unknown>) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "BookHotel",
    body,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function retrieveReservation(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "RetrieveReservation",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function confirmReservation(body: { SystemPnr: string; LastName: string; PaymentInfo: Record<string, unknown> }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "ConfirmReservation",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function cancelReservation(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "CancelReservation",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function voidReservation(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "VoidReservation",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function getBooking(body: { SystemPnr: string; LastName: string }) {
  return travelrobotRequest({
    service: "Hotel",
    operation: "GetHotelBooking",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}
