-- Add extended workflow fields to quotes
alter table if exists public.quotes
  add column if not exists quote_amount numeric,
  add column if not exists email_sent_at timestamptz,
  add column if not exists distance_miles numeric,
  add column if not exists duration_seconds integer,
  add column if not exists estimated_delivery_date date,
  add column if not exists admin_notes text;

-- Allow non-negative quote_amount only
alter table if exists public.quotes
  drop constraint if exists quotes_quote_amount_check;
alter table if exists public.quotes
  add constraint quotes_quote_amount_check check (quote_amount is null or quote_amount >= 0);

-- Extend status enum to include quoted
alter table if exists public.quotes
  drop constraint if exists quotes_status_check;
alter table if exists public.quotes
  add constraint quotes_status_check check (
    status in ('new','contacted','booked','completed')
  );

-- Helpful indexes for admin workflows
create index if not exists idx_quotes_status_created_at on public.quotes(status, created_at desc);
create index if not exists idx_quotes_email_sent_at on public.quotes(email_sent_at);

-- Allow admins to update quotes directly when using anon key clients
drop policy if exists quotes_update_admin on public.quotes;
create policy quotes_update_admin on public.quotes
  for update to authenticated
  using (public.is_admin(auth.uid()));
