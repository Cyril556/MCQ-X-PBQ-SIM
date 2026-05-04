-- Anonymous device-id based ownership. No auth.users; we use a UUID stored in localStorage
-- and pass it as a header / column. RLS allows access only when the request's
-- device id (read from request.header 'x-device-id') matches the row's device_id.

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  exam_number int,
  mode text not null default 'exam',
  score_raw int not null default 0,
  score_total int not null default 0,
  score_scaled int not null default 0,
  passed boolean not null default false,
  duration_seconds int not null default 0,
  domain_breakdown jsonb not null default '{}'::jsonb,
  question_results jsonb not null default '[]'::jsonb,
  confidence_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index exam_attempts_device_idx on public.exam_attempts(device_id, created_at desc);

create table public.question_stats (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  question_id text not null,
  question_type text not null,
  domain text,
  times_attempted int not null default 0,
  times_correct int not null default 0,
  times_failed int not null default 0,
  last_result text,
  last_attempted_at timestamptz not null default now(),
  unique (device_id, question_id)
);
create index question_stats_device_idx on public.question_stats(device_id);

create table public.question_notes (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  question_id text not null,
  note text not null default '',
  updated_at timestamptz not null default now(),
  unique (device_id, question_id)
);
create index question_notes_device_idx on public.question_notes(device_id);

create table public.user_settings (
  device_id uuid primary key,
  target_exam_date date,
  weekly_question_target int default 100,
  daily_minutes_goal int default 30,
  default_mode text default 'tutor',
  confidence_required text default 'optional',
  font_size text default 'normal',
  reduce_motion boolean default false,
  amber_threshold_seconds int default 1200,
  red_threshold_seconds int default 300,
  updated_at timestamptz not null default now()
);

create table public.active_session (
  device_id uuid primary key,
  exam_number int,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Helper: read the device id from request headers
create or replace function public.current_device_id()
returns uuid
language sql
stable
as $$
  select nullif(
    current_setting('request.headers', true)::json->>'x-device-id',
    ''
  )::uuid
$$;

-- RLS: only rows matching the request's x-device-id are accessible.
alter table public.exam_attempts enable row level security;
alter table public.question_stats enable row level security;
alter table public.question_notes enable row level security;
alter table public.user_settings enable row level security;
alter table public.active_session enable row level security;

create policy "device owns exam_attempts" on public.exam_attempts
  for all using (device_id = public.current_device_id())
  with check (device_id = public.current_device_id());

create policy "device owns question_stats" on public.question_stats
  for all using (device_id = public.current_device_id())
  with check (device_id = public.current_device_id());

create policy "device owns question_notes" on public.question_notes
  for all using (device_id = public.current_device_id())
  with check (device_id = public.current_device_id());

create policy "device owns user_settings" on public.user_settings
  for all using (device_id = public.current_device_id())
  with check (device_id = public.current_device_id());

create policy "device owns active_session" on public.active_session
  for all using (device_id = public.current_device_id())
  with check (device_id = public.current_device_id());