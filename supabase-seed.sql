-- Sample seed (replace PARENT_UUID with a real auth user id)
insert into user_profiles (id, display_name, role, parent_id, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Sample Parent', 'parent', null, now());

insert into user_profiles (id, display_name, role, parent_id, created_at)
values
  ('22222222-2222-2222-2222-222222222222', 'Sample Child', 'child', '11111111-1111-1111-1111-111111111111', now());

insert into chores (user_id, title, description, points, status, created_at)
values
  ('22222222-2222-2222-2222-222222222222', 'Make bed', 'Tidy the bed in the morning', 5, 'completed', now()),
  ('22222222-2222-2222-2222-222222222222', 'Read 20 pages', 'Read a chapter from your book', 10, 'pending', now());

insert into books (user_id, title, total_pages, pages_read, started_at)
values
  ('22222222-2222-2222-2222-222222222222', 'Harry Potter', 300, 45, now());

insert into allowance (user_id, month, year, total_amount, amount_used)
values
  ('22222222-2222-2222-2222-222222222222', extract(month from now())::int, extract(year from now())::int, 100, 20);
