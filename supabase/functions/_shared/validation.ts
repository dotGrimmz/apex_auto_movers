export function isSignupBody(b: any): b is {
  email: string;
  password: string;
  name: string;
} {
  return (
    b &&
    typeof b.email === "string" &&
    typeof b.password === "string" &&
    typeof b.name === "string"
  );
}

export function isQuoteBody(b: any): b is {
  name: string;
  email: string;
  phone?: string | null;
  pickup: string;
  delivery: string;
  make: string;
  model: string;
  transport_type: "open" | "enclosed";
  pickup_date?: string | null;
} {
  return (
    b &&
    typeof b.name === "string" &&
    typeof b.email === "string" &&
    typeof b.pickup === "string" &&
    typeof b.delivery === "string" &&
    typeof b.make === "string" &&
    typeof b.model === "string" &&
    (b.transport_type === "open" || b.transport_type === "enclosed")
  );
}

export function isValidStatus(
  s: any
): s is "new" | "contacted" | "booked" | "completed" {
  return ["new", "contacted", "booked", "completed"].includes(s);
}

export function isQuoteUpdateBody(
  b: any
): b is Partial<{
  status: string;
  quote_amount: number | null;
  admin_notes: string | null;
  pickup_date: string | null;
  estimated_delivery_date: string | null;
}> {
  if (!b || typeof b !== "object") return false;
  const allowedKeys = [
    "status",
    "quote_amount",
    "admin_notes",
    "pickup_date",
    "estimated_delivery_date",
  ];
  const keys = Object.keys(b);
  if (keys.length === 0) return false;
  return keys.every((key) => allowedKeys.includes(key));
}
