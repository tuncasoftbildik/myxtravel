export type ServiceType = "transfer" | "tour" | "hotel" | "car" | "bus";

export type BookingStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "cancelled"
  | "completed";

export type BaseProduct = {
  id: string;
  agency_id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  photos: string[];
  cover_photo: string;
  price: number;
  currency: string;
  price_note: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type TransferDetails = {
  from_location: string;
  to_location: string;
  vehicle_type: "sedan" | "minivan" | "minibus" | "bus";
  max_passengers: number;
  duration_minutes?: number;
  includes?: string[];
  round_trip?: boolean;
};

export type TourDetails = {
  duration_days: number;
  duration_nights: number;
  departure_point?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  meeting_point?: string;
  languages?: string[];
};

export type TransferProduct = BaseProduct & {
  service_type: "transfer";
  details: TransferDetails;
};

export type TourProduct = BaseProduct & {
  service_type: "tour";
  details: TourDetails;
};

export type AgencyProduct = TransferProduct | TourProduct;

export type AgencyProductRequest = {
  id: string;
  agency_id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  requested_date: string | null;
  passenger_count: number;
  notes: string;
  status: BookingStatus;
  agency_notes: string;
  created_at: string;
  updated_at: string;
};
