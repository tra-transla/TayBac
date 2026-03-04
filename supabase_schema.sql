-- SUPABASE DATABASE SCHEMA FOR TÂY BẮC TOURIST
-- Copy and paste this into the Supabase SQL Editor

-- 1. Create Categories Table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure unique constraints exist (in case table was created without them)
do $$ 
begin
    if not exists (select 1 from pg_constraint where conname = 'categories_name_key') then
        alter table categories add constraint categories_name_key unique (name);
    end if;
    if not exists (select 1 from pg_constraint where conname = 'categories_slug_key') then
        alter table categories add constraint categories_slug_key unique (slug);
    end if;
end $$;

-- Enable RLS for categories
alter table categories enable row level security;

-- Policies for categories
drop policy if exists "Categories are viewable by everyone" on categories;
create policy "Categories are viewable by everyone" on categories for select using (true);
drop policy if exists "Categories are manageable by authenticated users" on categories;
create policy "Categories are manageable by authenticated users" on categories for all using (auth.role() = 'authenticated');

-- 2. Create Posts Table
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  image_url text,
  external_link text,
  category_id uuid references categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for posts
alter table posts enable row level security;

-- Policies for posts
drop policy if exists "Posts are viewable by everyone" on posts;
create policy "Posts are viewable by everyone" on posts for select using (true);
drop policy if exists "Posts are manageable by authenticated users" on posts;
create policy "Posts are manageable by authenticated users" on posts for all using (auth.role() = 'authenticated');

-- 3. Create Tours Table
create table if not exists tours (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  image_url text,
  vtour_url text not null,
  category_id uuid references categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for tours
alter table tours enable row level security;

-- Policies for tours
drop policy if exists "Tours are viewable by everyone" on tours;
create policy "Tours are viewable by everyone" on tours for select using (true);
drop policy if exists "Tours are manageable by authenticated users" on tours;
create policy "Tours are manageable by authenticated users" on tours for all using (auth.role() = 'authenticated');

-- 4. Create News Table
create table if not exists news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  image_url text,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for news
alter table news enable row level security;

-- Policies for news
drop policy if exists "News are viewable by everyone" on news;
create policy "News are viewable by everyone" on news for select using (true);
drop policy if exists "News are manageable by authenticated users" on news;
create policy "News are manageable by authenticated users" on news for all using (auth.role() = 'authenticated');

-- 5. Insert Initial Categories
insert into categories (name, slug) values 
('Lịch sử', 'lich-su'),
('Thiên nhiên', 'thien-nhien'),
('Văn hóa', 'van-hoa'),
('Tôn giáo', 'ton-giao')
on conflict (name) do nothing;

-- 6. Create Slides Table
create table if not exists slides (
  id uuid default gen_random_uuid() primary key,
  title text,
  subtitle text,
  image_url text not null,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for slides
alter table slides enable row level security;

-- Policies for slides
drop policy if exists "Slides are viewable by everyone" on slides;
create policy "Slides are viewable by everyone" on slides for select using (true);
drop policy if exists "Slides are manageable by authenticated users" on slides;
create policy "Slides are manageable by authenticated users" on slides for all using (auth.role() = 'authenticated');
