-- HanMeet row-level security policies (Phase 5 bootstrap)

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.notebook_entries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "user_progress_select_own" on public.user_progress;
create policy "user_progress_select_own"
  on public.user_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "user_progress_insert_own" on public.user_progress;
create policy "user_progress_insert_own"
  on public.user_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_progress_update_own" on public.user_progress;
create policy "user_progress_update_own"
  on public.user_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notebook_select_own" on public.notebook_entries;
create policy "notebook_select_own"
  on public.notebook_entries
  for select
  using (auth.uid() = user_id);

drop policy if exists "notebook_insert_own" on public.notebook_entries;
create policy "notebook_insert_own"
  on public.notebook_entries
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "notebook_update_own" on public.notebook_entries;
create policy "notebook_update_own"
  on public.notebook_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notebook_delete_own" on public.notebook_entries;
create policy "notebook_delete_own"
  on public.notebook_entries
  for delete
  using (auth.uid() = user_id);

