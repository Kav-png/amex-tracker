-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

-- Enable pgcrypto for UUID generation (already enabled in Supabase)
-- create extension if not exists pgcrypto;

-- ────────────────────────────────────────────
-- Tables
-- ────────────────────────────────────────────

create table if not exists public.truclayer_connections (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  account_id    text not null,
  created_at    timestamptz default now() not null
);

create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  external_id      text not null,
  amount           numeric(12,2) not null,
  currency         text not null default 'GBP',
  description      text,
  merchant_name    text,
  timestamp        timestamptz not null,
  category         text,
  custom_category  text,
  transaction_type text not null default 'DEBIT' check (transaction_type in ('DEBIT', 'CREDIT')),
  excluded         boolean not null default false,
  exclusion_note   text,
  created_at       timestamptz default now() not null
);

create table if not exists public.custom_categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  color      text,
  created_at timestamptz default now() not null,
  unique (user_id, name)
);

-- ────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────

create unique index if not exists transactions_user_external_id_key
  on public.transactions (user_id, external_id);

create index if not exists idx_transactions_user_timestamp
  on public.transactions (user_id, timestamp desc);

create index if not exists idx_transactions_type
  on public.transactions (user_id, transaction_type);

-- ────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────

alter table public.truclayer_connections enable row level security;
alter table public.transactions enable row level security;
alter table public.custom_categories enable row level security;

-- TrueLayer connections: own row only
create policy "Own connection"
  on public.truclayer_connections
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Transactions: own rows only
create policy "Own transactions"
  on public.transactions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Custom categories: own rows only
create policy "Own categories"
  on public.custom_categories
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
