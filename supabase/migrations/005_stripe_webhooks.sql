begin;
create table if not exists thrive4_admin.stripe_events (
  event_id text primary key,
  account_id text not null,
  event_type text not null,
  session_id text not null,
  outcome text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
alter table thrive4_admin.stripe_events enable row level security;
revoke all on thrive4_admin.stripe_events from public, anon, authenticated;
grant select,insert,update on thrive4_admin.stripe_events to thrive4_invoice_app;
drop policy if exists admin_runtime on thrive4_admin.stripe_events;
create policy admin_runtime on thrive4_admin.stripe_events to thrive4_invoice_app using(true) with check(true);
commit;
