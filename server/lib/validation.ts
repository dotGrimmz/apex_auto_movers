export function isSignupBody(b: any): b is { email: string; password: string; name: string } {
  return b && typeof b.email==='string' && typeof b.password==='string' && typeof b.name==='string';
}

export function isQuoteBody(b: any): b is {
  name: string; email: string; phone?: string | null; pickup: string; delivery: string; make: string; model: string; transport_type: 'open' | 'enclosed'; pickup_date?: string | null;
} {
  return b && typeof b.name==='string' && typeof b.email==='string' && typeof b.pickup==='string' && typeof b.delivery==='string' && typeof b.make==='string' && typeof b.model==='string' && (b.transport_type==='open' || b.transport_type==='enclosed');
}

export function isValidStatus(s: any): s is 'new'|'contacted'|'booked'|'completed' {
  return ['new','contacted','booked','completed'].includes(s);
}

