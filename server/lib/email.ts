type SendQuoteEmailOptions = {
  to: string;
  customerName: string;
  quoteAmount: number;
  pickup: string;
  delivery: string;
  transportType: string;
  message?: string;
};

/**
 * sendQuoteEmail is a placeholder for integrating with a transactional email provider
 * such as Resend or SendGrid. It currently logs the payload and resolves immediately.
 * Replace the body with the provider SDK call when credentials are available.
 */
export async function sendQuoteEmail({
  to,
  customerName,
  quoteAmount,
  pickup,
  delivery,
  transportType,
  message,
}: SendQuoteEmailOptions) {
  // eslint-disable-next-line no-console
  console.log("[sendQuoteEmail] sending quote email", {
    to,
    customerName,
    quoteAmount,
    pickup,
    delivery,
    transportType,
    message,
  });
}

