-- Core helper for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Profiles are updatable by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Voice assistants
create table if not exists public.voice_assistants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  system_prompt text not null default '',
  language text not null default 'en',
  conversation_mode text not null default 'neutral',
  temperature double precision not null default 0.7,
  voice_provider text not null default 'elevenlabs',
  voice_id text,
  voice_speed double precision not null default 1.0,
  tools jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_voice_assistants_user_id on public.voice_assistants(user_id);

alter table public.voice_assistants enable row level security;

create policy "Assistants are readable by owner"
on public.voice_assistants
for select
to authenticated
using (auth.uid() = user_id);

create policy "Assistants are insertable by owner"
on public.voice_assistants
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Assistants are updatable by owner"
on public.voice_assistants
for update
to authenticated
using (auth.uid() = user_id);

create policy "Assistants are deletable by owner"
on public.voice_assistants
for delete
to authenticated
using (auth.uid() = user_id);

create trigger set_voice_assistants_updated_at
before update on public.voice_assistants
for each row execute function public.set_updated_at();
