import { acente2Request } from "./client";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ───────────────────────────────────────────────────────────

export interface A2Tour {
  id: number;
  name: string;
  nights: number;
  transportationType: string;
  [key: string]: any;
}

export interface A2TourDetail {
  id: number;
  name: string;
  generalInfo: string;
  tourProgram: any[];
  images: { url: string; title?: string }[];
  departureStops: any[];
  categoryList: any[];
  [key: string]: any;
}

export interface A2TourDate {
  id: number;
  startDate: string;
  endDate: string;
  dpp: number;
  single: number;
  extraBed: number;
  child1: number;
  child2: number;
  quota: number;
  currency: string;
  [key: string]: any;
}

export interface A2PriceResult {
  searchToken: string;
  totalPrice: number;
  currency: string;
  available: boolean;
  [key: string]: any;
}

export interface A2SaleResult {
  saleID: number;
  pnr: string;
  [key: string]: any;
}

export interface A2Category {
  id: number;
  name: string;
  subCategories?: A2Category[];
  [key: string]: any;
}

// ─── Response wrapper (Acente2 returns { isSuccess, result, ... }) ──

interface A2Response<T> {
  isSuccess: boolean;
  hasError: boolean;
  errorCode: string | null;
  errorDescription: string | null;
  result: T;
  resultDate: string;
}

// ─── API Functions ───────────────────────────────────────────────────

/** 1. Tüm turları listele */
export async function getTourList() {
  return acente2Request<A2Response<A2Tour[]>>("getTourList");
}

/** 2. Tur detaylarını getir */
export async function getTourDetail(tourId: number) {
  return acente2Request<A2Response<A2TourDetail>>("getTourDetail", { TourID: tourId });
}

/** 3. Tur tarihlerini ve fiyatlarını getir */
export async function getTourDates(tourId: number) {
  return acente2Request<A2Response<A2TourDate[]>>("getTourDates", { TourID: tourId });
}

/** 4. Gerçek zamanlı fiyat hesapla + müsaitlik kontrolü */
export async function calculateTourPrice(data: {
  TourID: number;
  date: string;       // YYYY-MM-DD
  roomCount: number;
  rooms: { adults: number; child1?: number; child2?: number; child3?: number; child4?: number }[];
}) {
  return acente2Request<A2Response<A2PriceResult>>("calculateTourPrice", data);
}

/** 5. Rezervasyon oluştur (searchToken ile) */
export async function addSale(data: {
  searchToken: string;
  passengers: {
    name: string;
    surname: string;
    birthDate: string;
    gender: string;
    tckn?: string;
    passport?: string;
    phone?: string;
    email?: string;
  }[];
  contactPhone: string;
  contactEmail: string;
  note?: string;
}) {
  return acente2Request<A2Response<A2SaleResult>>("addSale", data);
}

/** 6. Rezervasyonu tamamla */
export async function completeBooking(saleId: number) {
  return acente2Request<A2Response<any>>("completeBooking", { saleID: saleId });
}

/** 7. Tur kategorileri */
export async function tourCategories() {
  return acente2Request<A2Response<A2Category[]>>("tourCategories");
}

/** 8. Kategorilere ait turlar */
export async function tourCategoryRegList(categoryId?: number) {
  return acente2Request<A2Response<any[]>>(
    "tourCategoryRegList",
    categoryId ? { categoryId } : {},
  );
}
