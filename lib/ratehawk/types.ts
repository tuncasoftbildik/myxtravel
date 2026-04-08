/**
 * RateHawk B2B v3 types (subset — extended as needed).
 * Source: https://docs.emergingtravel.com/docs/b2b-api/
 */

export interface RhGuest {
  adults: number;
  children: number[]; // ages
}

export interface RhSearchRequest {
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  residency: string; // e.g. "tr"
  language: string; // e.g. "en"
  guests: RhGuest[];
  currency?: string; // e.g. "EUR"
  region_id?: number;
  hotels?: string[]; // hotel ids for byHotelIds search
}

export interface RhDailyPrice {
  amount: string;
  currency_code: string;
}

export interface RhRatePrice {
  show_amount: string;
  show_currency_code: string;
  amount: string;
  currency_code: string;
}

export interface RhRate {
  match_hash: string;
  book_hash: string;
  daily_prices?: RhDailyPrice[];
  payment_options?: {
    payment_types?: Array<{
      amount: string;
      currency_code: string;
      show_amount?: string;
      show_currency_code?: string;
      type?: string;
      tax_data?: unknown;
      cancellation_penalties?: unknown;
    }>;
  };
  room_name?: string;
  room_data_trans?: {
    main_room_type?: string;
    main_name?: string;
    bathroom?: string;
    bedding_type?: string;
  };
  meal?: string;
  meal_data?: { value?: string; has_breakfast?: boolean; no_child_meal?: boolean };
}

export interface RhHotelResult {
  id: string; // RateHawk hotel id (hid)
  rates: RhRate[];
}

export interface RhSearchResponse {
  hotels: RhHotelResult[];
  total_hotels?: number;
}

export interface RhPrebookRequest {
  book_hash: string;
  price_increase_percent?: number;
}

export interface RhBookRequest {
  partner_order_id: string;
  book_hash: string;
  language: string;
  user_ip?: string;
  rooms: Array<{
    guests: Array<{ first_name: string; last_name: string }>;
  }>;
  payment_type: {
    type: string;
    amount: string;
    currency_code: string;
  };
}
