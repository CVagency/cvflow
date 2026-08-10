-- CVFLOW — schéma Supabase (Phase 1)
-- À exécuter dans Supabase → SQL Editor. Auth gérée par Supabase Auth (table auth.users).

create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Membres de l'agence (liés à auth.users). role: 'ADMIN' | 'CHATTER'. pct = commission %.
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text,
  role text not null default 'CHATTER',
  pct int not null default 0,
  color text default '#0d9488',
  created_at timestamptz default now()
);

create table if not exists models (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade,
  name text not null,
  persona jsonb default '{}',
  tg_connected boolean default false,
  wa_connected boolean default false,
  dropp_api_key text,           -- config compte / stats (chiffré côté serveur)
  proxy text default 'FR-residential',
  created_at timestamptz default now()
);

-- Coffre média : dossiers ordonnés + items (niveaux) avec lien Dropp collé par l'agence.
create table if not exists vault_folders (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references models(id) on delete cascade,
  name text not null,
  position int default 0
);
create table if not exists vault_items (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references vault_folders(id) on delete cascade,
  name text not null,
  type text default 'photo',          -- photo|video|audio|bundle
  level int default 1,                -- ordre d'envoi
  price numeric default 0,            -- 0 = gratuit
  dropp_link text,                    -- lien payant Dropp collé par l'agence
  preview_url text
);

create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references models(id) on delete cascade,
  command text not null,              -- ex: /accroche
  title text,
  body text
);

create table if not exists fans (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references models(id) on delete cascade,
  name text,
  source text,                        -- wa|tg
  tg_user_id text,
  wa_phone text,
  tag text default 'new',             -- vip|whale|new|cold
  spent numeric default 0,
  fiche jsonb default '{}',
  notes text,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid references fans(id) on delete cascade,
  model_id uuid references models(id) on delete cascade,
  sender_member_id uuid references members(id),  -- qui a envoyé (attribution)
  direction text not null,            -- in|out
  kind text default 'text',           -- text|ppv|media
  body text,
  vault_item_id uuid references vault_items(id),
  created_at timestamptz default now()
);

-- Ventes : chaque paiement Dropp attribué au chatteur qui a envoyé le média. AUCUN bug d'attribution.
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade,
  model_id uuid references models(id),
  fan_id uuid references fans(id),
  member_id uuid references members(id),  -- chatteur crédité
  vault_item_id uuid references vault_items(id),
  amount numeric not null,
  dropp_payment_id text,              -- id de paiement Dropp (webhook)
  created_at timestamptz default now()
);

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  model_id uuid references models(id),
  start_at timestamptz,
  end_at timestamptz
);

-- Vue d'attribution : CA par membre × commission
create or replace view member_revenue as
  select m.id as member_id, m.name, m.pct,
         coalesce(sum(s.amount),0) as ca_generated,
         round(coalesce(sum(s.amount),0) * m.pct / 100.0, 2) as commission
  from members m
  left join sales s on s.member_id = m.id
  group by m.id, m.name, m.pct;

-- RLS : à activer + policies par agency_id (chaque agence voit ses données ; chatteur restreint au chat/coffre/planning).
-- alter table members enable row level security; ... (voir README)
