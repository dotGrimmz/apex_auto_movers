import type { QuoteBody, SignupBody } from "../types/index.ts";

export function requireFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]) {
  for (const f of fields) if (obj[f] == null || obj[f] === '') return String(f);
  return null;
}

export function validateSignup(b: any): b is SignupBody {
  return b && typeof b.email === 'string' && typeof b.password === 'string' && typeof b.name === 'string';
}

export function validateQuote(b: any): b is QuoteBody {
  const ok = b && typeof b.name==='string' && typeof b.email==='string' && typeof b.pickup==='string' && typeof b.delivery==='string' && typeof b.make==='string' && typeof b.model==='string' && (b.transport_type==='open' || b.transport_type==='enclosed');
  return !!ok;
}

