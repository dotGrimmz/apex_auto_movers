type SendQuoteEmailOptions = {
  to: string;
  customerName: string;
  quoteAmount: number;
  pickup: string;
  delivery: string;
  transportType: string;
  message?: string;
};

export async function sendQuoteEmail(options: SendQuoteEmailOptions) {
  console.log("[sendQuoteEmail]", options);
}
