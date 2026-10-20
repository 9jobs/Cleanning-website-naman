-- Run in your Supabase SQL editor before setting SUBMISSIONS_ENABLED=true.
create table public.submissions (
 id uuid primary key, kind text not null check (kind in ('booking','contact','quote','careers')),
 payload jsonb not null, resume_path text,
 status text not null default 'new' check (status in ('new','reviewing','confirmed','closed')),
 notification_status text not null default 'pending', created_at timestamptz not null default now()
);
alter table public.submissions enable row level security;
revoke all on public.submissions from anon, authenticated;
-- No public policies. Staff review through the Supabase dashboard with authorised project access.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('resumes','resumes',false,5242880,array['application/pdf']) on conflict (id) do nothing;
create table public.submission_limits (client_hash text primary key, window_start timestamptz not null, attempts int not null);
alter table public.submission_limits enable row level security;
revoke all on public.submission_limits from anon, authenticated;
create function public.allow_submission(client_hash text) returns boolean language plpgsql security definer set search_path=public as $$
declare count_now int;
begin
 insert into public.submission_limits as limits (client_hash,window_start,attempts) values ($1,now(),1)
 on conflict (client_hash) do update set
 attempts=case when limits.window_start < now()-interval '15 minutes' then 1 else limits.attempts+1 end,
 window_start=case when limits.window_start < now()-interval '15 minutes' then now() else limits.window_start end
 returning attempts into count_now;
 return count_now <= 5;
end; $$;
revoke all on function public.allow_submission(text) from public,anon,authenticated;
grant execute on function public.allow_submission(text) to service_role;
-- Schedule retention cleanup to match your approved privacy policy. Rows contain personal data.
