import type { User } from "npm:@supabase/supabase-js@2";

export type Role = "user" | "admin";

export interface SignupBody {
  email: string;
  password: string;
  name: string;
}

export interface QuoteBody {
  name: string;
  email: string;
  phone?: string | null;
  pickup: string;
  delivery: string;
  make: string;
  model: string;
  transport_type: "open" | "enclosed";
  pickup_date?: string | null;
}

export type AppBindings = {
  Variables: {
    requestId: string;
    user?: User;
  };
};
