-- Blog posts table
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text default '',
  content text default '',
  cover_image text default '',
  author text default 'Admin',
  category text default 'Genel',
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Public can read published posts
alter table blog_posts enable row level security;

create policy "Public read published blog posts"
  on blog_posts for select
  using (is_published = true);

create policy "Admins manage blog posts"
  on blog_posts for all
  using (true)
  with check (true);

-- Index for faster slug lookups
create index if not exists blog_posts_slug_idx on blog_posts (slug);
create index if not exists blog_posts_published_idx on blog_posts (is_published, published_at desc);
