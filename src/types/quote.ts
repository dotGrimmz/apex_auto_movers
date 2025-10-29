export type QuoteStatus = "new" | "contacted" | "booked" | "completed";

export interface Quote {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  pickup: string;
  delivery: string;
  make: string;
  model: string;
  transport_type: "open" | "enclosed";
  pickup_date: string | null;
  status: QuoteStatus;
  quote_amount: number | null;
  email_sent_at: string | null;
  distance_miles: number | null;
  duration_seconds: number | null;
  estimated_delivery_date: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteEmailPayload {
  quote_amount: number;
  message?: string;
}
