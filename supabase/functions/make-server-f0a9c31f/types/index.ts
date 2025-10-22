export type Role = 'user' | 'admin';

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
  transport_type: 'open' | 'enclosed';
  pickup_date?: string | null;
}

