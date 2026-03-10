-- ============================================
-- AI Website Builder - Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Untitled Project',
  prompt text not null,
  html_content text not null default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.projects enable row level security;

-- RLS Policies: users can only see/edit their own projects
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_projects_update
  before update on public.projects
  for each row execute procedure public.handle_updated_at();

-- Index for fast user project lookups
create index projects_user_id_idx on public.projects(user_id);
create index projects_updated_at_idx on public.projects(updated_at desc);
