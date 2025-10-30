import type { QuoteBody, SignupBody } from "../types/index.ts";

export function isSignupBody(body: unknown): body is SignupBody {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return (
    typeof value.email === "string" &&
    typeof value.password === "string" &&
    typeof value.name === "string"
  );
}

export function isQuoteBody(body: unknown): body is QuoteBody {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  return (
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.pickup === "string" &&
    typeof value.delivery === "string" &&
    typeof value.make === "string" &&
    typeof value.model === "string" &&
    (value.transport_type === "open" || value.transport_type === "enclosed")
  );
}

export function isValidStatus(status: unknown): status is "new" | "contacted" | "booked" | "completed" {
  return ["new", "contacted", "booked", "completed"].includes(String(status));
}

export function isQuoteUpdateBody(
  body: unknown
): body is Partial<{
  status: string;
  quote_amount: number | null;
  admin_notes: string | null;
  pickup_date: string | null;
  estimated_delivery_date: string | null;
}> {
  if (!body || typeof body !== "object") return false;
  const allowedKeys = [
    "status",
    "quote_amount",
    "admin_notes",
    "pickup_date",
    "estimated_delivery_date",
  ];
  const keys = Object.keys(body as Record<string, unknown>);
  if (keys.length === 0) return false;
  return keys.every((key) => allowedKeys.includes(key));
}
