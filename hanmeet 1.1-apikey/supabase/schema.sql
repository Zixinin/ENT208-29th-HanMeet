-- HanMeet core schema (Phase 5 bootstrap)

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_preset_id text not null default 'red-fox',
  outfit_color text not null default '#10b981',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level integer not null default 1,
  xp integer not null default 0,
  unlocked_spaces text[] not null default array['classroom'],
  selected_difficulty text not null default 'easy',
  updated_at timestamptz not null default now(),
  constraint user_progress_difficulty_chk
    check (selected_difficulty in ('easy', 'medium', 'hard'))
);

create table if not exists public.notebook_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vocab_id text,
  source text not null check (source in ('space', 'dictionary_local', 'dictionary_ai')),
  english text not null,
  chinese_simplified text not null,
  pinyin text not null,
  example text,
  ai_generated boolean not null default false,
  mastery integer not null default 0,
  interval_days integer not null default 1,
  due_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, english, chinese_simplified)
);

create index if not exists idx_notebook_entries_user_due
  on public.notebook_entries (user_id, due_at);

