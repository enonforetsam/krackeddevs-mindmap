-- Supabase SQL: run this in the SQL editor at app.supabase.com

-- Mind map nodes
create table nodes (
  id text primary key,
  x float8 default 0,
  y float8 default 0,
  title text not null default 'New node',
  "desc" text default '',
  link text default '',
  type text default 'default',
  color text,
  status text default 'todo',
  created_at timestamptz default now()
);

-- Edges between nodes
create table edges (
  id uuid primary key default gen_random_uuid(),
  from_id text references nodes(id) on delete cascade,
  to_id text references nodes(id) on delete cascade,
  edge_type text default 'hierarchy'
);

-- Team members
create table team_members (
  id text primary key,
  name text not null,
  role text default '',
  dept text default 'labs',
  emp text default 'fulltime',
  email text default '',
  twitter text default '',
  github text default '',
  x float8 default 0,
  y float8 default 0,
  position int default 0,
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id text primary key,
  name text not null,
  url text default '',
  status text default 'idea',
  "desc" text default '',
  tags text[] default '{}',
  lead text default '',
  x float8 default 0,
  y float8 default 0,
  created_at timestamptz default now()
);

-- Kanban columns (per project)
create table kanban_columns (
  id uuid primary key default gen_random_uuid(),
  project_id text references projects(id) on delete cascade,
  name text not null,
  position int default 0
);

-- Kanban cards
create table kanban_cards (
  id text primary key,
  column_id uuid references kanban_columns(id) on delete cascade,
  text text default '',
  color text default 'yellow',
  position int default 0,
  created_at timestamptz default now()
);

-- Node canvas items (per node mini canvas)
create table canvas_items (
  id text primary key,
  node_id text references nodes(id) on delete cascade,
  type text not null, -- 'text' | 'sticky' | 'shape' | 'subbox'
  x float8 default 0,
  y float8 default 0,
  text text default '',
  title text default '',
  body text default '',
  shape text default '',
  color text default 'yellow'
);

-- Sticky notes on team/structure canvas
create table sticky_notes (
  id text primary key,
  view text not null, -- 'team' | 'structure'
  x float8 default 0,
  y float8 default 0,
  text text default '',
  color text default 'yellow'
);

-- Enable realtime on all tables
alter publication supabase_realtime add table nodes;
alter publication supabase_realtime add table edges;
alter publication supabase_realtime add table team_members;
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table kanban_columns;
alter publication supabase_realtime add table kanban_cards;
alter publication supabase_realtime add table canvas_items;
alter publication supabase_realtime add table sticky_notes;

-- Allow public read/write (lock down with RLS + auth later)
alter table nodes enable row level security;
alter table edges enable row level security;
alter table team_members enable row level security;
alter table projects enable row level security;
alter table kanban_columns enable row level security;
alter table kanban_cards enable row level security;
alter table canvas_items enable row level security;
alter table sticky_notes enable row level security;

create policy "Public access" on nodes for all using (true) with check (true);
create policy "Public access" on edges for all using (true) with check (true);
create policy "Public access" on team_members for all using (true) with check (true);
create policy "Public access" on projects for all using (true) with check (true);
create policy "Public access" on kanban_columns for all using (true) with check (true);
create policy "Public access" on kanban_cards for all using (true) with check (true);
create policy "Public access" on canvas_items for all using (true) with check (true);
create policy "Public access" on sticky_notes for all using (true) with check (true);
