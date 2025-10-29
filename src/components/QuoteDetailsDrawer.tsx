import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Quote, QuoteEmailPayload } from "../types/quote";
import "./QuoteDetailsDrawer.css";

function formatCurrency(amount?: number | null) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

interface QuoteDetailsDrawerProps {
  open: boolean;
  quote: Quote | null;
  onOpenChange: (open: boolean) => void;
  onSendQuote: (quoteId: string, payload: QuoteEmailPayload) => Promise<void>;
  onSaveDetails: (
    quoteId: string,
    payload: Partial<Pick<Quote, "quote_amount" | "admin_notes">>
  ) => Promise<void>;
  sending: boolean;
  saving: boolean;
}

export function QuoteDetailsDrawer({
  open,
  quote,
  onOpenChange,
  onSendQuote,
  onSaveDetails,
  sending,
  saving,
}: QuoteDetailsDrawerProps) {
  const [quoteAmount, setQuoteAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && quote) {
      setQuoteAmount(
        quote.quote_amount != null ? String(quote.quote_amount) : ""
      );
      setNotes(quote.admin_notes ?? "");
      setMessage("");
    }
  }, [open, quote]);

  const vehicle = useMemo(() => {
    if (!quote) return "";
    return `${quote.make} ${quote.model}`.trim();
  }, [quote]);

  async function handleSendQuote() {
    if (!quote) return;
    const amountNumber = Number(quoteAmount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      alert("Please provide a valid quote amount greater than zero.");
      return;
    }
    await onSendQuote(quote.id, {
      quote_amount: amountNumber,
      message: message.trim() ? message.trim() : undefined,
    });
  }

  async function handleSaveDetails() {
    if (!quote) return;
    const amountNumber = quoteAmount === "" ? null : Number(quoteAmount);
    if (
      amountNumber !== null &&
      (!Number.isFinite(amountNumber) || amountNumber < 0)
    ) {
      alert("Quote amount must be a positive number.");
      return;
    }
    await onSaveDetails(quote.id, {
      quote_amount: amountNumber,
      admin_notes: notes.trim() || null,
    });
  }

  if (!open || !quote) return null;

  return createPortal(
    <div
      className="quote-drawer__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-drawer-title"
      aria-describedby="quote-drawer-description"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <aside className="quote-drawer" role="document">
        <main className="quote-drawer__body">
          <header className="quote-drawer__header">
            <div>
              <h2 id="quote-drawer-title" className="quote-drawer__title">
                Quote Details {vehicle ? `– ${vehicle}` : ""}
              </h2>
              <p
                id="quote-drawer-description"
                className="quote-drawer__subtitle"
              >
                Review quote information, capture an amount, and send a
                confirmation email without leaving the admin dashboard.
              </p>
            </div>
            <button
              type="button"
              className="quote-drawer__close"
              onClick={() => onOpenChange(false)}
              aria-label="Close details"
            >
              ×
            </button>
          </header>
          <section className="quote-drawer__section">
            <h3 className="quote-drawer__section-title">Customer</h3>
            <article className="quote-drawer__card">
              <div className="quote-drawer__card-header">
                <p className="quote-drawer__customer-name">{quote.name}</p>
                <span
                  className={`quote-drawer__status quote-drawer__status--${quote.status}`}
                >
                  {quote.status.toUpperCase()}
                </span>
              </div>
              <p className="quote-drawer__muted">{quote.email}</p>
              {quote.phone && (
                <p className="quote-drawer__muted">{quote.phone}</p>
              )}
              <p className="quote-drawer__meta">
                Requested on {new Date(quote.created_at).toLocaleDateString()}
              </p>
              {quote.email_sent_at && (
                <p className="quote-drawer__meta quote-drawer__meta--success">
                  Email sent {new Date(quote.email_sent_at).toLocaleString()}
                </p>
              )}
            </article>
          </section>

          <section className="quote-drawer__section">
            <h3 className="quote-drawer__section-title">Transport details</h3>
            <article className="quote-drawer__card quote-drawer__grid">
              <div>
                <p className="quote-drawer__label">Pickup</p>
                <p>{quote.pickup}</p>
              </div>
              <div>
                <p className="quote-drawer__label">Delivery</p>
                <p>{quote.delivery}</p>
              </div>
              <div>
                <p className="quote-drawer__label">Vehicle</p>
                <p>{vehicle}</p>
              </div>
              <div>
                <p className="quote-drawer__label">Transport type</p>
                <p>{quote.transport_type}</p>
              </div>
              {quote.distance_miles != null && (
                <div>
                  <p className="quote-drawer__label">Distance</p>
                  <p>{Number(quote.distance_miles).toLocaleString()} miles</p>
                </div>
              )}
              {quote.duration_seconds != null && (
                <div>
                  <p className="quote-drawer__label">Estimated duration</p>
                  <p>
                    {Math.round(Number(quote.duration_seconds) / 3600)} hours
                  </p>
                </div>
              )}
              {quote.estimated_delivery_date && (
                <div>
                  <p className="quote-drawer__label">Estimated delivery</p>
                  <p>
                    {new Date(
                      quote.estimated_delivery_date
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </article>
          </section>

          <section className="quote-drawer__section">
            <h3 className="quote-drawer__section-title">Quote workflow</h3>
            <article className="quote-drawer__card quote-drawer__stack">
              <label className="quote-drawer__label" htmlFor="quote-amount">
                Quote amount (USD)
              </label>
              <input
                id="quote-amount"
                className="quote-drawer__input"
                inputMode="decimal"
                value={quoteAmount}
                onChange={(event) => setQuoteAmount(event.target.value)}
                placeholder="e.g. 1299.00"
              />
              <p className="quote-drawer__meta">
                Current: {formatCurrency(quote.quote_amount)}
              </p>

              <label className="quote-drawer__label" htmlFor="quote-message">
                Email message (optional)
              </label>
              <textarea
                id="quote-message"
                className="quote-drawer__textarea"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Custom message to include in the email..."
              />

              <label className="quote-drawer__label" htmlFor="quote-notes">
                Admin notes
              </label>
              <textarea
                id="quote-notes"
                className="quote-drawer__textarea"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Private notes for internal reference..."
              />
            </article>
          </section>
          <footer className="quote-drawer__footer">
            <p className="quote-drawer__meta">
              Amounts are saved immediately when you send the quote. Use “Save
              details” to persist notes without emailing the customer.
            </p>
            <div className="quote-drawer__actions">
              <button
                type="button"
                className="quote-drawer__btn"
                onClick={handleSaveDetails}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save details"}
              </button>
              <button
                type="button"
                className="quote-drawer__btn quote-drawer__btn--primary"
                onClick={handleSendQuote}
                disabled={sending}
              >
                {sending ? "Sending…" : "Send quote email"}
              </button>
            </div>
          </footer>
        </main>
      </aside>
    </div>,
    document.body
  );
}
