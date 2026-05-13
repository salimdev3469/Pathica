-- Users managed by Supabase Auth

create table if not exists cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default 'My CV',
  is_anonymous boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists cvs add column if not exists ats_score integer;
alter table if exists cvs add column if not exists ats_score_updated_at timestamptz;

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


create table if not exists cv_email_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique,
  status text not null default 'pending', -- pending | sent | failed
  cv_state jsonb not null,
  fingerprint text,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  verified_at timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_cv_email_requests_token on cv_email_requests(token);
create index if not exists idx_cv_email_requests_email on cv_email_requests(email);
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

-- Billing (fixed USD packages + credit wallet)
create table if not exists credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credit_balance integer not null default 0 check (credit_balance >= 0),
  free_exports_remaining integer not null default 0 check (free_exports_remaining >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  feature text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_credit_ledger_user_id_created_at on credit_ledger(user_id, created_at desc);

create table if not exists shopier_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  buyer_email text not null,
  package_code text not null,
  package_price_usd numeric(10, 2) not null,
  credit_amount integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'credited', 'review_required', 'rejected', 'failed')),
  shopier_order_id text unique,
  shopier_product_id text,
  checkout_url text,
  failure_reason text,
  paid_at timestamptz,
  credited_at timestamptz,
  approved_at timestamptz,
  approved_by_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_shopier_payments_user_status on shopier_payments(user_id, status, created_at desc);
create index if not exists idx_shopier_payments_email_status on shopier_payments(buyer_email, status, created_at desc);

create table if not exists shopier_webhook_events (
  id uuid primary key default gen_random_uuid(),
  webhook_id text not null unique,
  event text not null,
  payload jsonb not null,
  status text not null default 'received' check (status in ('received', 'processed', 'ignored', 'failed')),
  error_message text,
  received_at timestamptz default now(),
  processed_at timestamptz
);

create index if not exists idx_shopier_webhook_events_event_received on shopier_webhook_events(event, received_at desc);

alter table credit_wallets enable row level security;
alter table credit_ledger enable row level security;
alter table shopier_payments enable row level security;
alter table shopier_webhook_events enable row level security;

create or replace function public.init_wallet_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.credit_wallets (user_id, credit_balance, free_exports_remaining)
  values (new.id, 10, 1)
  on conflict (user_id) do nothing;

  insert into public.credit_ledger (user_id, delta, reason, metadata)
  values (
    new.id,
    10,
    'signup_bonus',
    jsonb_build_object('free_exports_remaining', 1)
  );

  return new;
end;
$$;

drop trigger if exists trg_init_wallet_for_new_user on auth.users;
create trigger trg_init_wallet_for_new_user
after insert on auth.users
for each row execute function public.init_wallet_for_new_user();

create or replace function public.consume_user_entitlement(
  p_user_id uuid,
  p_feature text,
  p_credit_cost integer,
  p_allow_free_export boolean default false,
  p_metadata jsonb default '{}'::jsonb
)
returns table(
  success boolean,
  code text,
  consumed_credits integer,
  consumed_free_export boolean,
  credit_balance integer,
  free_exports_remaining integer,
  ledger_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.credit_wallets%rowtype;
  v_ledger_id uuid;
begin
  if p_user_id is null then
    return query select false, 'USER_REQUIRED', 0, false, 0, 0, null::uuid;
    return;
  end if;

  if p_credit_cost < 0 then
    return query select false, 'INVALID_COST', 0, false, 0, 0, null::uuid;
    return;
  end if;

  insert into public.credit_wallets (user_id, credit_balance, free_exports_remaining)
  values (p_user_id, 0, 0)
  on conflict (user_id) do nothing;

  select *
    into v_wallet
    from public.credit_wallets
    where user_id = p_user_id
    for update;

  if p_allow_free_export and coalesce(v_wallet.free_exports_remaining, 0) > 0 then
    update public.credit_wallets
      set free_exports_remaining = v_wallet.free_exports_remaining - 1,
          updated_at = now()
      where user_id = p_user_id;

    insert into public.credit_ledger (user_id, delta, reason, feature, metadata)
      values (p_user_id, 0, 'free_export_used', p_feature, p_metadata)
      returning id into v_ledger_id;

    return query
      select true, 'OK', 0, true, v_wallet.credit_balance, v_wallet.free_exports_remaining - 1, v_ledger_id;
    return;
  end if;

  if v_wallet.credit_balance < p_credit_cost then
    return query
      select false, 'INSUFFICIENT_CREDITS', 0, false, v_wallet.credit_balance, v_wallet.free_exports_remaining, null::uuid;
    return;
  end if;

  update public.credit_wallets
    set credit_balance = v_wallet.credit_balance - p_credit_cost,
        updated_at = now()
    where user_id = p_user_id;

  insert into public.credit_ledger (user_id, delta, reason, feature, metadata)
    values (p_user_id, -p_credit_cost, 'credit_usage', p_feature, p_metadata)
    returning id into v_ledger_id;

  return query
    select true, 'OK', p_credit_cost, false, v_wallet.credit_balance - p_credit_cost, v_wallet.free_exports_remaining, v_ledger_id;
end;
$$;

create or replace function public.refund_user_entitlement(
  p_user_id uuid,
  p_feature text,
  p_consumed_credits integer default 0,
  p_consumed_free_export boolean default false,
  p_metadata jsonb default '{}'::jsonb
)
returns table(
  success boolean,
  code text,
  credit_balance integer,
  free_exports_remaining integer,
  ledger_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.credit_wallets%rowtype;
  v_ledger_id uuid;
  v_credit_delta integer;
begin
  if p_user_id is null then
    return query select false, 'USER_REQUIRED', 0, 0, null::uuid;
    return;
  end if;

  if p_consumed_credits < 0 then
    return query select false, 'INVALID_CREDIT_DELTA', 0, 0, null::uuid;
    return;
  end if;

  insert into public.credit_wallets (user_id, credit_balance, free_exports_remaining)
  values (p_user_id, 0, 0)
  on conflict (user_id) do nothing;

  select *
    into v_wallet
    from public.credit_wallets
    where user_id = p_user_id
    for update;

  update public.credit_wallets
    set credit_balance = v_wallet.credit_balance + p_consumed_credits,
        free_exports_remaining = v_wallet.free_exports_remaining + (case when p_consumed_free_export then 1 else 0 end),
        updated_at = now()
    where user_id = p_user_id;

  v_credit_delta := p_consumed_credits;

  insert into public.credit_ledger (user_id, delta, reason, feature, metadata)
    values (p_user_id, v_credit_delta, 'credit_refund', p_feature, p_metadata)
    returning id into v_ledger_id;

  return query
    select true,
      'OK',
      v_wallet.credit_balance + p_consumed_credits,
      v_wallet.free_exports_remaining + (case when p_consumed_free_export then 1 else 0 end),
      v_ledger_id;
end;
$$;

create or replace function public.grant_credits_for_payment(
  p_payment_id uuid,
  p_reason text default 'shopier_package_purchase'
)
returns table(
  success boolean,
  code text,
  user_id uuid,
  credit_balance integer,
  ledger_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.shopier_payments%rowtype;
  v_wallet public.credit_wallets%rowtype;
  v_ledger_id uuid;
begin
  select *
    into v_payment
    from public.shopier_payments
    where id = p_payment_id
    for update;

  if not found then
    return query select false, 'PAYMENT_NOT_FOUND', null::uuid, 0, null::uuid;
    return;
  end if;

  if v_payment.user_id is null then
    return query select false, 'USER_NOT_MAPPED', null::uuid, 0, null::uuid;
    return;
  end if;

  if v_payment.status = 'credited' then
    select *
      into v_wallet
      from public.credit_wallets
      where public.credit_wallets.user_id = v_payment.user_id;

    return query select true, 'ALREADY_CREDITED', v_payment.user_id, coalesce(v_wallet.credit_balance, 0), null::uuid;
    return;
  end if;

  insert into public.credit_wallets (user_id, credit_balance, free_exports_remaining)
  values (v_payment.user_id, 0, 0)
  on conflict (user_id) do nothing;

  select *
    into v_wallet
    from public.credit_wallets
    where public.credit_wallets.user_id = v_payment.user_id
    for update;

  update public.credit_wallets
    set credit_balance = v_wallet.credit_balance + v_payment.credit_amount,
        updated_at = now()
    where public.credit_wallets.user_id = v_payment.user_id;

  insert into public.credit_ledger (user_id, delta, reason, feature, metadata)
    values (
      v_payment.user_id,
      v_payment.credit_amount,
      p_reason,
      v_payment.package_code,
      jsonb_build_object(
        'payment_id', v_payment.id,
        'shopier_order_id', v_payment.shopier_order_id,
        'package_code', v_payment.package_code
      )
    )
    returning id into v_ledger_id;

  update public.shopier_payments
    set status = 'credited',
        credited_at = now(),
        updated_at = now()
    where id = v_payment.id;

  return query
    select true, 'OK', v_payment.user_id, v_wallet.credit_balance + v_payment.credit_amount, v_ledger_id;
end;
$$;
