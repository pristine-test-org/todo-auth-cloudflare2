-- Tally Private keeps one list per signed-in person. Rows belong to the user who added them
-- (user_id defaults to auth.uid()), and row level security lets each user see and change only
-- their own rows. The anon role gets nothing.

create table public.private_todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index private_todos_user_created_at_idx on public.private_todos (user_id, created_at desc);

alter table public.private_todos enable row level security;

revoke all on public.private_todos from anon;
grant select, insert, update, delete on public.private_todos to authenticated;

create policy "Users read their own todos" on public.private_todos
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users add their own todos" on public.private_todos
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users update their own todos" on public.private_todos
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users delete their own todos" on public.private_todos
  for delete to authenticated using ((select auth.uid()) = user_id);
