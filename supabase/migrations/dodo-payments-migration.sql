-- Dodo Payments integration tables

create table if not exists dodo_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  buyer_email text not null,
  package_code text not null,
  package_price numeric(10, 2) not null,
  currency text not null default 'TRY',
  credit_amount integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'credited', 'refunded', 'failed', 'disputed')),
  dodo_session_id text unique,
  dodo_payment_id text unique,
  dodo_customer_id text,
  dodo_subscription_id text,
  billing_type text not null default 'one_time'
    check (billing_type in ('one_time', 'subscription')),
  checkout_url text,
  metadata jsonb,
  failure_reason text,
  paid_at timestamptz,
  credited_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_dodo_payments_user_status on dodo_payments(user_id, status, created_at desc);
create index if not exists idx_dodo_payments_session on dodo_payments(dodo_session_id);
create index if not exists idx_dodo_payments_payment_id on dodo_payments(dodo_payment_id);

create table if not exists dodo_webhook_events (
  id uuid primary key default gen_random_uuid(),
  webhook_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'received'
    check (status in ('received', 'processed', 'ignored', 'failed')),
  error_message text,
  received_at timestamptz default now(),
  processed_at timestamptz
);

create index if not exists idx_dodo_webhook_events_type on dodo_webhook_events(event_type, received_at desc);

alter table dodo_payments enable row level security;
alter table dodo_webhook_events enable row level security;
