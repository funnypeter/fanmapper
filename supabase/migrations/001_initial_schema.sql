-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  steam_id text,
  psn_id text,
  xbox_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Games table (cached from IGDB/RAWG)
create table public.games (
  id text primary key,
  igdb_id integer unique,
  title text not null,
  cover_url text,
  genres jsonb default '[]',
  platforms jsonb default '[]',
  release_date text,
  summary text,
  created_at timestamptz not null default now()
);

-- User's game library
create table public.user_games (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id text not null references public.games(id),
  status text not null default 'backlog' check (status in ('playing', 'completed', 'dropped', 'wishlist', 'backlog')),
  playtime_minutes integer not null default 0,
  rating integer check (rating between 1 and 5),
  review text,
  platform text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, game_id)
);

-- Achievements
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  game_id text not null references public.games(id),
  platform text not null,
  external_id text not null,
  name text not null,
  description text,
  icon_url text,
  global_unlock_percent real,
  unique(game_id, platform, external_id)
);

-- User achievements
create table public.user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id),
  is_earned boolean not null default false,
  earned_at timestamptz,
  unique(user_id, achievement_id)
);

-- Indexes
create index idx_user_games_user on public.user_games(user_id);
create index idx_user_games_status on public.user_games(user_id, status);
create index idx_achievements_game on public.achievements(game_id);
create index idx_user_achievements_user on public.user_achievements(user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.user_games enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- Profiles: users can read any profile, update only their own
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Games: anyone can read, authenticated users can insert (for caching)
create policy "Games are viewable by everyone" on public.games for select using (true);
create policy "Authenticated users can insert games" on public.games for insert with check (auth.role() = 'authenticated');

-- User games: users can CRUD only their own
create policy "Users can view own games" on public.user_games for select using (auth.uid() = user_id);
create policy "Users can add games" on public.user_games for insert with check (auth.uid() = user_id);
create policy "Users can update own games" on public.user_games for update using (auth.uid() = user_id);
create policy "Users can delete own games" on public.user_games for delete using (auth.uid() = user_id);

-- Achievements: readable by all
create policy "Achievements are viewable by everyone" on public.achievements for select using (true);
create policy "Authenticated users can insert achievements" on public.achievements for insert with check (auth.role() = 'authenticated');

-- User achievements: users can CRUD only their own
create policy "Users can view own achievements" on public.user_achievements for select using (auth.uid() = user_id);
create policy "Users can add achievements" on public.user_achievements for insert with check (auth.uid() = user_id);
create policy "Users can update own achievements" on public.user_achievements for update using (auth.uid() = user_id);
