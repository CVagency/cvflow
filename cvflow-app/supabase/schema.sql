-- CVFLOW — schéma réel (auth + RLS). À coller dans Supabase → SQL Editor → Run.
-- Idempotent : réexécutable sans casser l'existant.

create extension if not exists "pgcrypto";

-- Agences
create table if not exists cvflow_agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mon agence',
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Profils (1 par utilisateur auth) : rôle + commission + agence
create table if not exists cvflow_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid references cvflow_agencies(id) on delete cascade,
  name text,
  email text,
  role text not null default 'CHATTER',      -- ADMIN | CHATTER
  pct int not null default 0,
  color text default '#0d9488',
  created_at timestamptz default now()
);

create table if not exists cvflow_models (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references cvflow_agencies(id) on delete cascade,
  name text not null,
  persona jsonb default '{}',
  tg_connected boolean default false,
  wa_connected boolean default false,
  dropp_api_key text,
  created_at timestamptz default now()
);

create table if not exists cvflow_vault_folders (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references cvflow_models(id) on delete cascade,
  name text not null,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists cvflow_vault_items (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references cvflow_vault_folders(id) on delete cascade,
  name text not null,
  type text default 'photo',
  level int default 1,
  price numeric default 0,
  dropp_link text,
  created_at timestamptz default now()
);

create table if not exists cvflow_scripts (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references cvflow_models(id) on delete cascade,
  command text not null,
  title text,
  body text,
  created_at timestamptz default now()
);

create table if not exists cvflow_fans (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references cvflow_models(id) on delete cascade,
  agency_id uuid references cvflow_agencies(id) on delete cascade,
  name text,
  source text default 'tg',
  tag text default 'new',
  spent numeric default 0,
  fiche jsonb default '{}',
  notes text,
  created_at timestamptz default now()
);

create table if not exists cvflow_messages (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid references cvflow_fans(id) on delete cascade,
  model_id uuid references cvflow_models(id) on delete cascade,
  agency_id uuid references cvflow_agencies(id) on delete cascade,
  sender_id uuid references cvflow_profiles(id) on delete set null,
  direction text not null default 'out',       -- in | out
  kind text default 'text',                     -- text | ppv
  body text,
  vault_item_id uuid references cvflow_vault_items(id) on delete set null,
  price numeric default 0,
  unlocked boolean default false,
  created_at timestamptz default now()
);

create table if not exists cvflow_sales (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references cvflow_agencies(id) on delete cascade,
  model_id uuid references cvflow_models(id) on delete set null,
  fan_id uuid references cvflow_fans(id) on delete set null,
  member_id uuid references cvflow_profiles(id) on delete set null,
  amount numeric not null default 0,
  created_at timestamptz default now()
);

-- Helper : agence de l'utilisateur courant
create or replace function cvflow_my_agency() returns uuid
language sql stable security definer set search_path = public as $$
  select agency_id from cvflow_profiles where id = auth.uid()
$$;

-- Nouvel utilisateur → crée agence + profil ADMIN (ou rattache via metadata invitation)
create or replace function cvflow_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  inv_agency uuid;
  inv_role text;
  new_agency uuid;
begin
  inv_agency := (new.raw_user_meta_data->>'agency_id')::uuid;
  inv_role := coalesce(new.raw_user_meta_data->>'role', 'ADMIN');
  if inv_agency is null then
    insert into cvflow_agencies (name, owner_id)
      values (coalesce(new.raw_user_meta_data->>'agency_name', 'Mon agence'), new.id)
      returning id into new_agency;
    insert into cvflow_profiles (id, agency_id, name, email, role, pct)
      values (new.id, new_agency, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email, 'ADMIN', 0);
  else
    insert into cvflow_profiles (id, agency_id, name, email, role, pct)
      values (new.id, inv_agency,
              coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
              new.email, inv_role,
              coalesce((new.raw_user_meta_data->>'pct')::int, 0));
  end if;
  return new;
end $$;

drop trigger if exists cvflow_on_auth_user_created on auth.users;
create trigger cvflow_on_auth_user_created
  after insert on auth.users
  for each row execute function cvflow_handle_new_user();

-- RLS : chaque agence ne voit que ses données
do $$
declare t text;
begin
  foreach t in array array['cvflow_agencies','cvflow_profiles','cvflow_models','cvflow_vault_folders','cvflow_vault_items','cvflow_scripts','cvflow_fans','cvflow_messages','cvflow_sales']
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- Policies (drop puis recreate pour idempotence)
drop policy if exists p_ag on cvflow_agencies;
create policy p_ag on cvflow_agencies for all using (id = cvflow_my_agency()) with check (id = cvflow_my_agency());

drop policy if exists p_prof_sel on cvflow_profiles;
create policy p_prof_sel on cvflow_profiles for select using (agency_id = cvflow_my_agency());
drop policy if exists p_prof_upd on cvflow_profiles;
create policy p_prof_upd on cvflow_profiles for update using (agency_id = cvflow_my_agency()) with check (agency_id = cvflow_my_agency());

-- Tables rattachées directement à agency_id
do $$
declare t text;
begin
  foreach t in array array['cvflow_models','cvflow_fans','cvflow_messages','cvflow_sales']
  loop
    execute format('drop policy if exists p_%1$s on %1$s;', t);
    execute format('create policy p_%1$s on %1$s for all using (agency_id = cvflow_my_agency()) with check (agency_id = cvflow_my_agency());', t);
  end loop;
end $$;

-- Tables rattachées via le modèle
drop policy if exists p_vf on cvflow_vault_folders;
create policy p_vf on cvflow_vault_folders for all
  using (model_id in (select id from cvflow_models where agency_id = cvflow_my_agency()))
  with check (model_id in (select id from cvflow_models where agency_id = cvflow_my_agency()));

drop policy if exists p_sc on cvflow_scripts;
create policy p_sc on cvflow_scripts for all
  using (model_id in (select id from cvflow_models where agency_id = cvflow_my_agency()))
  with check (model_id in (select id from cvflow_models where agency_id = cvflow_my_agency()));

drop policy if exists p_vi on cvflow_vault_items;
create policy p_vi on cvflow_vault_items for all
  using (folder_id in (select f.id from cvflow_vault_folders f join cvflow_models m on m.id=f.model_id where m.agency_id = cvflow_my_agency()))
  with check (folder_id in (select f.id from cvflow_vault_folders f join cvflow_models m on m.id=f.model_id where m.agency_id = cvflow_my_agency()));
