-- Dedicated contact form storage. Apply with an authorised database connection.
-- No customer records can be read or written through the public Supabase API.
begin;
create table if not exists public.contact_enquiries (
  id uuid primary key,
  request_digest text not null,
  name text not null,
  email text not null,
  phone text not null,
  service text not null,
  property_type text not null,
  location text not null,
  bedrooms integer not null,
  bathrooms integer not null,
  frequency text not null,
  floor_area numeric,
  preferred_date date,
  message text not null default '',
  consent boolean not null check (consent),
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
alter table public.contact_enquiries enable row level security;
revoke all on public.contact_enquiries from public, anon, authenticated;
create index if not exists contact_enquiries_created_at_idx
  on public.contact_enquiries (created_at desc);

create table if not exists public.contact_request_limits (
  client_hash text primary key,
  window_start timestamptz not null default now(),
  attempts integer not null default 1
);
alter table public.contact_request_limits enable row level security;
revoke all on public.contact_request_limits from public, anon, authenticated;
commit;
