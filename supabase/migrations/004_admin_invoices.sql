begin;
create schema if not exists thrive4_admin;
revoke all on schema thrive4_admin from public, anon, authenticated;
create table if not exists thrive4_admin.workspace (
  id integer primary key check(id=1),
  invoices jsonb not null default '[]'::jsonb check(jsonb_typeof(invoices)='array'),
  updated_at timestamptz not null default now()
);
insert into thrive4_admin.workspace(id) values(1) on conflict do nothing;
create table if not exists thrive4_admin.history (
  invoice_id uuid not null, revision integer not null, action text not null check(action in ('edit','delete')),
  invoice jsonb not null, archived_at timestamptz not null default now(),
  primary key(invoice_id,revision,action)
);
create table if not exists thrive4_admin.sessions (
  token_hash text primary key, configuration text not null, expires_at timestamptz not null
);
create table if not exists thrive4_admin.login_limit (
  id integer primary key check(id=1), attempts integer not null, window_end timestamptz not null
);
alter table thrive4_admin.workspace enable row level security;
alter table thrive4_admin.history enable row level security;
alter table thrive4_admin.sessions enable row level security;
alter table thrive4_admin.login_limit enable row level security;
revoke all on all tables in schema thrive4_admin from public, anon, authenticated;
commit;
