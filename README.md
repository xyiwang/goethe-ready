# GoetheReady

GoetheReady is an AI-assisted prep platform for Goethe German exams (React + Vite + Tailwind CSS).

## Run locally

```bash
npm install
npm run dev
```

## Environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required:

- `VITE_OPENAI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Supabase setup (Phase 5)

1. Create a Supabase project.
2. Enable Email auth (Authentication -> Providers -> Email).
3. Run the SQL below in Supabase SQL Editor:

```sql
create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  days integer not null,
  level text not null,
  start_date date not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  completed_tasks text[] not null default '{}',
  vocab_count integer not null default 0,
  is_complete boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.vocab_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  vocab_index integer not null default 0,
  mastered_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.vocab_progress enable row level security;

create policy "Users can manage own plans" on public.user_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own daily checkins" on public.daily_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own vocab progress" on public.vocab_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## Cloud sync behavior

- Users sign in/up with email and password.
- Study progress writes to `localStorage` as local cache and to Supabase tables.
