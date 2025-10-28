import { createClient } from "./supabase/client";

const API_BASE_URL = "/api"; // same-origin Next.js API

async function getAuthToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null as any;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  console.log(token, "token");
  console.log(`${API_BASE_URL}${endpoint}`, "endpoint");
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  console.log(response, "response");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

export const api = {
  // Auth
  signup: (email: string, password: string, name: string) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  // Quotes
  submitQuote: (quoteData: {
    name: string;
    email: string;
    phone?: string;
    pickup: string;
    delivery: string;
    make: string;
    model: string;
    transport_type: "open" | "enclosed";
    pickup_date?: string;
  }) =>
    apiRequest("/quote", {
      method: "POST",
      body: JSON.stringify(quoteData),
    }),

  getMyQuotes: () => apiRequest("/quotes/my"),

  getAllQuotes: () => apiRequest("/quotes/all"),

  updateQuoteStatus: (quoteId: string, status: string) =>
    apiRequest(`/quotes/${quoteId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Newsletter
  subscribeNewsletter: (email: string) =>
    apiRequest("/newsletter", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Profile
  getProfile: () => apiRequest("/profile"),
};
