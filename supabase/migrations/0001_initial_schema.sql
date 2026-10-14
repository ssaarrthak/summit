-- Summit initial schema (mirrors the cloud project state, incl. the RLS recursion fix)

-- ============ PROFILES ============
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null check (char_length(username) between 3 and 24),
  display_name text,
  avatar_url   text,
  is_public    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============ GOALS ============
create table public.goals (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  description      text,
  category         text not null default 'TRAVEL'
                   check (category in ('TRAVEL','CREATIVE','SKILLS','ADRENALINE')),
  priority         text not null default 'normal' check (priority in ('high','normal')),
  status           text not null default 'active' check (status in ('active','completed')),
  progress         integer not null default 0 check (progress between 0 and 100),
  target_date      text,
  completed_at     timestamptz,
  is_collaborative boolean not null default false,
  cloned_from      text,
  created_at       timestamptz not null default now()
);

-- ============ COLLABORATORS ============
create table public.goal_collaborators (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.goals(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted')),
  invited_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (goal_id, user_id)
);

-- ============ INDEXES ============
create index goals_owner_idx on public.goals(owner_id);
create index goals_status_idx on public.goals(owner_id, status);
create index collab_goal_idx on public.goal_collaborators(goal_id);
create index collab_user_idx on public.goal_collaborators(user_id);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'display_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ HELPER (breaks RLS recursion between goals <-> goal_collaborators) ============
create function public.is_goal_collaborator(p_goal_id uuid, p_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.goal_collaborators gc
    where gc.goal_id = p_goal_id and gc.user_id = p_user_id and gc.status = 'accepted'
  );
$$;

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.goal_collaborators enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (true);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "goals_select_own" on public.goals
  for select using (auth.uid() = owner_id);
create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = owner_id);
create policy "goals_update_own" on public.goals
  for update using (auth.uid() = owner_id);
create policy "goals_delete_own" on public.goals
  for delete using (auth.uid() = owner_id);

create policy "goals_select_public" on public.goals
  for select using (
    exists (select 1 from public.profiles p
            where p.id = goals.owner_id and p.is_public = true)
  );

create policy "goals_select_collab" on public.goals
  for select using (public.is_goal_collaborator(goals.id, auth.uid()));
create policy "goals_update_collab" on public.goals
  for update using (public.is_goal_collaborator(goals.id, auth.uid()));

create policy "collab_select" on public.goal_collaborators
  for select using (
    auth.uid() = user_id or invited_by = auth.uid()
    or exists (select 1 from public.goals g where g.id = goal_id and g.owner_id = auth.uid())
  );
create policy "collab_insert" on public.goal_collaborators
  for insert with check (auth.uid() = invited_by);
create policy "collab_update_own" on public.goal_collaborators
  for update using (auth.uid() = user_id);
