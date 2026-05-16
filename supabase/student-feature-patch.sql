create table if not exists student_saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, opportunity_id)
);

create table if not exists student_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  status text default 'applied',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, opportunity_id)
);

create table if not exists student_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  read boolean default false,
  type text default 'info',
  created_at timestamptz default now()
);

create index if not exists idx_saved_user
on student_saved_opportunities(user_id);

create index if not exists idx_applications_user
on student_applications(user_id);

create index if not exists idx_notifications_user
on student_notifications(user_id);

alter table student_saved_opportunities enable row level security;
alter table student_applications enable row level security;
alter table student_notifications enable row level security;

create policy "saved_select_own"
on student_saved_opportunities
for select
using (auth.uid() = user_id);

create policy "saved_insert_own"
on student_saved_opportunities
for insert
with check (auth.uid() = user_id);

create policy "saved_delete_own"
on student_saved_opportunities
for delete
using (auth.uid() = user_id);

create policy "applications_select_own"
on student_applications
for select
using (auth.uid() = user_id);

create policy "applications_insert_own"
on student_applications
for insert
with check (auth.uid() = user_id);

create policy "applications_update_own"
on student_applications
for update
using (auth.uid() = user_id);

create policy "notifications_select_own"
on student_notifications
for select
using (auth.uid() = user_id);