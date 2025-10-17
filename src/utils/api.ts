import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from './supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f0a9c31f`;

async function getAuthToken(): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || publicAnonKey;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  signup: (email: string, password: string, name: string) =>
    apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  // Quotes
  submitQuote: (quoteData: any) =>
    apiRequest('/quote', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    }),

  getMyQuotes: () => apiRequest('/quotes/my'),

  getAllQuotes: () => apiRequest('/quotes/all'),

  updateQuoteStatus: (quoteId: string, status: string) =>
    apiRequest(`/quotes/${quoteId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Newsletter
  subscribeNewsletter: (email: string) =>
    apiRequest('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Profile
  getProfile: () => apiRequest('/profile'),
};
