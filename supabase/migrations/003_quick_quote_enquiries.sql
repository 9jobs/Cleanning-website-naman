-- Homepage quick quotes contain only the details the customer actually supplies.
-- Existing contact records and the full contact form are unchanged.
begin;
create table if not exists public.quick_quote_enquiries (
  id uuid primary key,
  request_digest text not null,
  name text not null,
  email text not null,
  phone text not null,
  consent boolean not null check (consent),
  source text not null default 'homepage-quick-quote',
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sending', 'sent', 'failed')),
  notification_attempts integer not null default 0,
  notification_claim uuid,
  notification_lease_until timestamptz,
  email_message_id text,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.quick_quote_enquiries enable row level security;
revoke all on public.quick_quote_enquiries from public, anon, authenticated;
create index if not exists quick_quote_enquiries_created_at_idx
  on public.quick_quote_enquiries (created_at desc);
commit;
