-- Per-goal visibility (PR #2) + Friendships (PR #3)

-- ============ PER-GOAL VISIBILITY ============
alter table public.goals add column if not exists visibility text not null default 'private'
  check (visibility in ('private','public'));

drop policy if exists "goals_select_public" on public.goals;
create policy "goals_select_public" on public.goals
  for select using (goals.visibility = 'public');

alter table public.profiles drop column if exists is_public;

-- ============ FRIENDSHIPS ============
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index friendships_requester_idx on public.friendships(requester_id);
create index friendships_addressee_idx on public.friendships(addressee_id);

alter table public.friendships enable row level security;

create policy "friendships_select_own" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "friendships_insert" on public.friendships
  for insert with check (auth.uid() = requester_id);
create policy "friendships_update_status" on public.friendships
  for update using (auth.uid() = addressee_id) with check (auth.uid() = addressee_id);
create policy "friendships_delete" on public.friendships
  for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);
