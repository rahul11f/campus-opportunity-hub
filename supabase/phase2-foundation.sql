create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  city text,
  state text,
  logo_url text,
  website_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists content_modules (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table opportunities
add column if not exists college_id uuid references colleges(id) on delete set null,
add column if not exists module_key text default 'placement',
add column if not exists source_college_name text,
add column if not exists notice_posted_at timestamptz,
add column if not exists retention_days integer default 30,
add column if not exists archived_at timestamptz,
add column if not exists registration_link text,
add column if not exists jd_link text,
add column if not exists company_website text,
add column if not exists company_logo text,
add column if not exists interview_mode text,
add column if not exists venue text,
add column if not exists joining_date text,
add column if not exists gender_eligibility text,
add column if not exists education_qualification text,
add column if not exists streams_specialization text;

create table if not exists eligibility_candidates (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  college_id uuid references colleges(id) on delete cascade,
  student_name text,
  father_name text,
  university_roll_no text,
  course text,
  branch text,
  batch text,
  backlogs text,
  eligible boolean default true,
  raw_row jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_eligibility_roll
on eligibility_candidates(university_roll_no);

create table if not exists student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  college_id uuid references colleges(id) on delete set null,
  full_name text,
  father_name text,
  university_roll_no text,
  branch text,
  batch text,
  cgpa text,
  backlogs text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into content_modules (key, name, description)
values
('placement','Placements','Campus placement opportunities'),
('internship','Internships','Internship opportunities'),
('academic_notice','Academic Notices','College academic notices'),
('exam_notice','Exam Notices','Exam related notices'),
('results','Results','Exam results'),
('important_links','Important Links','ERP, fee, exam portals'),
('faculty','Faculty Directory','Faculty contacts'),
('timetable','Timetable','Class schedule')
on conflict (key) do nothing;