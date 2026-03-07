-- Users managed by Supabase Auth

create table if not exists cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default 'My CV',
  is_anonymous boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cv_sections (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid references cvs(id) on delete cascade,
  title text not null,
  position integer not null,
  created_at timestamptz default now()
);

create table if not exists cv_fields (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references cv_sections(id) on delete cascade,
  label text not null,
  value text,
  field_type text default 'text', -- text | date | url | textarea
  position integer not null,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  plan text not null default 'free', -- free | pro | enterprise
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists anonymous_sessions (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  ip text,
  used_count integer default 0,
  created_at timestamptz default now()
);

create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  cv_id uuid references cvs(id),
  job_id text not null,
  job_title text,
  company text,
  status text default 'applied', -- applied | interviewing | rejected | offer
  applied_at timestamptz default now()
);

-- Basic RLS
alter table cvs enable row level security;
alter table cv_sections enable row level security;
alter table cv_fields enable row level security;
alter table subscriptions enable row level security;
alter table job_applications enable row level security;
-- anonymous_sessions is accessed only via service role in the backend
