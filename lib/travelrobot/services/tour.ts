import { travelrobotRequest } from "../client";

// SearchTour uses "filter" wrapper, everything else uses "request"

export async function searchTour(body: {
  SearchType: number;
  SearchValues?: string[];
  StartDate: string; // dd.MM.yyyy
  EndDate: string;   // dd.MM.yyyy
  AdvancedOptions?: Record<string, unknown>;
}) {
  return travelrobotRequest({
    service: "Tour",
    operation: "SearchTour",
    body: body as Record<string, unknown>,
    wrapper: "filter",
    tokenStyle: "nested",
  });
}

export async function getTourDetails(body: {
  TourCode: string;
  DetailTypes: number[];
  LanguageCode?: string;
}) {
  return travelrobotRequest({
    service: "Tour",
    operation: "GetTourDetails",
    body: { LanguageCode: "tr", ...body } as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getTourPrices(body: {
  TourAlternativeCode: string;
  Rooms: { Index: number; Paxes: { PaxType: number; Count: number }[] }[];
  AdvancedOptions?: Record<string, unknown>;
}) {
  return travelrobotRequest({
    service: "Tour",
    operation: "GetTourPrices",
    body: body as unknown as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getTourExtras(body: { PackageId: string; LanguageCode?: string }) {
  return travelrobotRequest({
    service: "Tour",
    operation: "GetTourExtras",
    body: { LanguageCode: "tr", ...body } as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getTourFinalPrice(body: {
  PackageId: string;
  TourRooms?: Record<string, unknown>[];
}) {
  return travelrobotRequest({
    service: "Tour",
    operation: "GetTourFinalPrice",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getPickupPoints(body: {
  PackageId: string;
  ProductType?: number;
  OrderId?: number;
  LanguageCode?: string;
  OperationType?: number;
}) {
  return travelrobotRequest({
    service: "Tour",
    operation: "GetPickupPoints",
    body: { ProductType: 2, OrderId: 0, LanguageCode: "tr", OperationType: 0, ...body } as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "nested",
  });
}

export async function getPaymentOptions(body: { ResultKeys: string[] }) {
  return travelrobotRequest({
    service: "Tour",
    operation: "GetPaymentOptions",
    body: body as Record<string, unknown>,
    wrapper: "request",
    tokenStyle: "direct",
  });
}

export async function bookTour(body: Record<string, unknown>) {
  return travelrobotRequest({
    service: "Tour",
    operation: "BookTour",
    body: { Version: "2.0", ProductType: 2, ...body },
    wrapper: "request",
    tokenStyle: "direct",
  });
}
