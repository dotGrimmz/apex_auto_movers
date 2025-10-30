type SendQuoteEmailOptions = {
  to: string;
  customerName: string;
  quoteAmount: number;
  pickup: string;
  delivery: string;
  transportType: string;
  message?: string;
};

export async function sendQuoteEmail({
  to,
  customerName,
  quoteAmount,
  pickup,
  delivery,
  transportType,
  message,
}: SendQuoteEmailOptions) {
  console.log("[email] sendQuoteEmail", {
    to,
    customerName,
    quoteAmount,
    pickup,
    delivery,
    transportType,
    message,
  });
}
