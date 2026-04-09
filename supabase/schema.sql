create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- UTILITY FUNCTIONS
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- TABLE DEFINITIONS & POLICIES
-- ─────────────────────────────────────────────────────────────

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null,
  class_designation text not null default 'Class 10',
  skill_level text not null default 'Beginner' check (skill_level in ('Beginner', 'Intermediate', 'Advanced')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  academic_year text not null default to_char(now(), 'YYYY'),
  user_role text,
  age_range text,
  primary_learning_goals text[] not null default '{}'::text[],
  learning_pace text,
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_user_role_check check (
    user_role is null or user_role in (
        'School Student (12-18)', 'College Student (18-25)', 'Self-Learner (Any Age)',
        'Teacher / Educator', 'Institution / School', 'Hiring Company',
        'School Student (Class 8-12)', 'College Student (Undergraduate)',
        'Graduate / Postgraduate (I have a degree)', 'Working Professional'
    )
  ),
  constraint profiles_age_range_check check (
    age_range is null or age_range in ('Under 16', '16-18', '19-22', '23-28', '29+')
  ),
  constraint profiles_learning_pace_check check (
    learning_pace is null or learning_pace in ('Light', 'Focused', 'Intensive')
  ),
  constraint profiles_primary_learning_goals_check check (
    primary_learning_goals <@ array[
      'Artificial Intelligence & ML', 'Web Development', 'App Development',
      'Data Science & Analytics', 'Cloud & DevOps', 'Cybersecurity',
      'UI/UX Design', 'Digital Marketing', 'Entrepreneurship & Startups'
    ]::text[] and cardinality(primary_learning_goals) <= 3
  )
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles 
for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles 
for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles 
for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- 2. Access Requests
create table if not exists public.access_requests (
    id uuid primary key default gen_random_uuid (),
    name text not null,
    email text not null,
    message text not null default '',
    created_at timestamptz not null default timezone ('utc', now())
);

alter table public.access_requests enable row level security;
drop policy if exists "Anyone can submit access requests" on public.access_requests;
create policy "Anyone can submit access requests" on public.access_requests 
for insert to anon with check (true);

-- 3. Chat Histories
create table if not exists public.chat_histories (
  user_id uuid primary key references auth.users (id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.chat_histories enable row level security;
drop policy if exists "Users can view their own chat history" on public.chat_histories;
create policy "Users can view their own chat history" on public.chat_histories 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own chat history" on public.chat_histories;
create policy "Users can insert their own chat history" on public.chat_histories 
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own chat history" on public.chat_histories;
create policy "Users can update their own chat history" on public.chat_histories 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 4. Student Personalization Profiles
create table if not exists public.student_personalization_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  source_provider text check (source_provider is null or source_provider in ('chatgpt', 'gemini', 'other')),
  source_prompt_version text,
  approved_facts jsonb,
  learner_summary text not null default '',
  confidence_summary text not null default '',
  assumptions text[] not null default '{}',
  dismissed_at timestamptz,
  last_generated_at timestamptz,
  last_model_provider text,
  last_model_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.student_personalization_profiles enable row level security;
drop policy if exists "Users can view their own personalization profile" on public.student_personalization_profiles;
create policy "Users can view their own personalization profile" on public.student_personalization_profiles 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own personalization profile" on public.student_personalization_profiles;
create policy "Users can insert their own personalization profile" on public.student_personalization_profiles 
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own personalization profile" on public.student_personalization_profiles;
create policy "Users can update their own personalization profile" on public.student_personalization_profiles 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 5. Student Dashboard Paths
create table if not exists public.student_dashboard_paths (
    user_id uuid primary key references auth.users (id) on delete cascade,
    path_title text not null,
    path_description text not null,
    path_status_label text not null default 'Live Path',
    path_progress integer not null default 0 check (path_progress >= 0 and path_progress <= 100),
    current_focus text not null,
    recommended_action_title text not null,
    recommended_action_description text not null,
    recommended_action_prompt text not null,
    learning_track_title text not null,
    learning_track_description text not null,
    completion_estimate_label text not null,
    mastery_progress integer not null default 0 check (mastery_progress >= 0 and mastery_progress <= 100),
    mastery_unlocked_count integer not null default 0 check (mastery_unlocked_count >= 0),
    mastery_total_count integer not null default 0 check (mastery_total_count >= 0),
    next_session_date_day text not null,
    next_session_date_month text not null,
    next_session_title text not null,
    next_session_day_label text not null,
    next_session_time_label text not null,
    next_session_instructor_name text not null,
    next_session_instructor_role text not null,
    next_session_instructor_image_url text not null,
    weekly_completed_sessions integer not null default 0 check (weekly_completed_sessions >= 0),
    weekly_change_label text not null,
    momentum_summary text not null,
    focus_summary text not null,
    consistency_summary text not null
);

alter table public.student_dashboard_paths enable row level security;
drop policy if exists "Users can view their own dashboard path" on public.student_dashboard_paths;
create policy "Users can view their own dashboard path" on public.student_dashboard_paths 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own dashboard path" on public.student_dashboard_paths;
create policy "Users can insert their own dashboard path" on public.student_dashboard_paths 
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own dashboard path" on public.student_dashboard_paths;
create policy "Users can update their own dashboard path" on public.student_dashboard_paths 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 6. Student Skill Progress
create table if not exists public.student_skill_progress (
    user_id uuid not null references auth.users (id) on delete cascade,
    skill_key text not null,
    title text not null,
    description text not null,
    level_label text not null,
    progress integer not null default 0 check (progress >= 0 and progress <= 100),
    icon_key text not null check (icon_key in ('python', 'logic', 'ml', 'data', 'networks', 'prompt')),
    tone_key text not null check (tone_key in ('primary', 'soft', 'muted')),
    locked boolean not null default false,
    sort_order integer not null default 0,
    primary key (user_id, skill_key)
);

alter table public.student_skill_progress enable row level security;
drop policy if exists "Users can view their own skill progress" on public.student_skill_progress;
create policy "Users can view their own skill progress" on public.student_skill_progress 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own skill progress" on public.student_skill_progress;
create policy "Users can insert their own skill progress" on public.student_skill_progress 
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own skill progress" on public.student_skill_progress;
create policy "Users can update their own skill progress" on public.student_skill_progress 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 7. Student Curriculum Nodes
create table if not exists public.student_curriculum_nodes (
    user_id uuid not null references auth.users (id) on delete cascade,
    node_key text not null,
    module_label text not null,
    title text not null,
    description text not null,
    status_label text not null,
    unlocked boolean not null default false,
    sort_order integer not null default 0,
    primary key (user_id, node_key)
);

alter table public.student_curriculum_nodes enable row level security;
drop policy if exists "Users can view their own curriculum nodes" on public.student_curriculum_nodes;
create policy "Users can view their own curriculum nodes" on public.student_curriculum_nodes 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own curriculum nodes" on public.student_curriculum_nodes;
create policy "Users can insert their own curriculum nodes" on public.student_curriculum_nodes 
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own curriculum nodes" on public.student_curriculum_nodes;
create policy "Users can update their own curriculum nodes" on public.student_curriculum_nodes 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 8. Student Practice Rooms
create table if not exists public.student_practice_rooms (
    user_id uuid not null references auth.users (id) on delete cascade,
    room_key text not null,
    title text not null,
    description text not null,
    status_label text not null,
    cta_label text not null,
    prompt text not null,
    featured boolean not null default false,
    texture_key text not null check (texture_key in ('python-room', 'neural-builder', 'data-explorer', 'prompt-lab')),
    sort_order integer not null default 0,
    primary key (user_id, room_key)
);

alter table public.student_practice_rooms enable row level security;
drop policy if exists "Users can view their own practice rooms" on public.student_practice_rooms;
create policy "Users can view their own practice rooms" on public.student_practice_rooms 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own practice rooms" on public.student_practice_rooms;
create policy "Users can insert their own practice rooms" on public.student_practice_rooms 
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own practice rooms" on public.student_practice_rooms;
create policy "Users can update their own practice rooms" on public.student_practice_rooms 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 9. Student Weekly Activity
create table if not exists public.student_weekly_activity (
    user_id uuid not null references auth.users (id) on delete cascade,
    day_key text not null,
    day_label text not null,
    container_height integer not null check (container_height >= 0),
    fill_height integer not null check (fill_height >= 0 and fill_height <= 100),
    highlighted boolean not null default false,
    sort_order integer not null default 0,
    primary key (user_id, day_key)
);

alter table public.student_weekly_activity enable row level security;
drop policy if exists "Users can view their own weekly activity" on public.student_weekly_activity;
create policy "Users can view their own weekly activity" on public.student_weekly_activity 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own weekly activity" on public.student_weekly_activity;
create policy "Users can insert their own weekly activity" on public.student_weekly_activity 
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own weekly activity" on public.student_weekly_activity;
create policy "Users can update their own weekly activity" on public.student_weekly_activity 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 10. Python Rooms (Dynamic Catalog)
create table if not exists public.python_rooms (
  id text primary key,
  topic text not null,
  room_number integer not null,
  title text not null,
  learning_goal text not null,
  concept_summary text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer not null,
  starter_code text not null,
  expected_output_hint text not null,
  success_criteria text[] not null default '{}'::text[],
  starter_guidance text[] not null default '{}'::text[],
  banned_concepts text[] not null default '{}'::text[],
  phase_label text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.python_rooms enable row level security;
drop policy if exists "Anyone can read python rooms" on public.python_rooms;
create policy "Anyone can read python rooms" on public.python_rooms 
for select to anon, authenticated using (true);

-- 11. Yantra Quiz Bank
create table if not exists public.yantra_quiz_bank (
    id uuid primary key default gen_random_uuid (),
    skill_key text not null,
    topic text not null,
    difficulty integer not null check (difficulty >= 1 and difficulty <= 5),
    content jsonb not null,
    created_at timestamptz not null default timezone ('utc', now())
);

alter table public.yantra_quiz_bank enable row level security;
drop policy if exists "Authenticated users can view quiz bank" on public.yantra_quiz_bank;
create policy "Authenticated users can view quiz bank" on public.yantra_quiz_bank 
for select to authenticated using (true);

-- 12. Yantra Challenges
create table if not exists public.yantra_challenges (
    id uuid primary key default gen_random_uuid (),
    skill_key text not null,
    topic text not null,
    difficulty integer not null check (difficulty >= 1 and difficulty <= 5),
    title text not null,
    description text not null,
    starter_code text,
    test_cases jsonb,
    created_at timestamptz not null default timezone ('utc', now())
);

alter table public.yantra_challenges enable row level security;
drop policy if exists "Authenticated users can view challenges" on public.yantra_challenges;
create policy "Authenticated users can view challenges" on public.yantra_challenges 
for select to authenticated using (true);

-- 13. Student Skill Mastery
create table if not exists public.student_skill_mastery (
    user_id uuid not null references auth.users (id) on delete cascade,
    skill_key text not null,
    mastery_score integer not null default 0 check (mastery_score >= 0 and mastery_score <= 100),
    quizzes_passed integer not null default 0 check (quizzes_passed >= 0),
    void_challenges_passed integer not null default 0 check (void_challenges_passed >= 0),
    updated_at timestamptz not null default timezone ('utc', now()),
    primary key (user_id, skill_key)
);

alter table public.student_skill_mastery enable row level security;
drop policy if exists "Users can view their own mastery" on public.student_skill_mastery;
create policy "Users can view their own mastery" on public.student_skill_mastery 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own mastery" on public.student_skill_mastery;
create policy "Users can update their own mastery" on public.student_skill_mastery 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own mastery" on public.student_skill_mastery;
create policy "Users can insert their own mastery" on public.student_skill_mastery 
for insert to authenticated with check ((select auth.uid()) = user_id);

-- 14. Student Void Sessions
create table if not exists public.student_void_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id uuid references public.yantra_challenges (id) on delete set null,
  skill_key text not null,
  status text not null check (status in ('started', 'completed', 'failed')),
  code_snapshot text,
  feedback_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.student_void_sessions enable row level security;
drop policy if exists "Users can view their own void sessions" on public.student_void_sessions;
create policy "Users can view their own void sessions" on public.student_void_sessions 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own void sessions" on public.student_void_sessions;
create policy "Users can insert their own void sessions" on public.student_void_sessions 
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own void sessions" on public.student_void_sessions;
create policy "Users can update their own void sessions" on public.student_void_sessions 
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 15. Student Quiz Results
create table if not exists public.student_quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id uuid references public.yantra_quiz_bank (id) on delete set null,
  skill_key text not null,
  score integer not null check (score >= 0),
  passed boolean not null default false,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.student_quiz_results enable row level security;
drop policy if exists "Users can view their own quiz results" on public.student_quiz_results;
create policy "Users can view their own quiz results" on public.student_quiz_results 
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own quiz results" on public.student_quiz_results;
create policy "Users can insert their own quiz results" on public.student_quiz_results 
for insert to authenticated with check ((select auth.uid()) = user_id);

-- 16. Student Certificates
create table if not exists public.student_certificates (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references auth.users (id) on delete cascade,
    skill_key text not null,
    issued_at timestamptz not null default timezone ('utc', now()),
    verification_hash text not null unique,
    is_public boolean not null default false
);

alter table public.student_certificates enable row level security;
drop policy if exists "Users can view their own certificates" on public.student_certificates;
create policy "Users can view their own certificates" on public.student_certificates 
for select to authenticated using ((select auth.uid()) = user_id or is_public = true);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────────────────────

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists set_chat_histories_updated_at on public.chat_histories;
create trigger set_chat_histories_updated_at before update on public.chat_histories
for each row execute function public.handle_updated_at();

drop trigger if exists set_student_personalization_profiles_updated_at on public.student_personalization_profiles;
create trigger set_student_personalization_profiles_updated_at before update on public.student_personalization_profiles
for each row execute function public.handle_updated_at();

drop trigger if exists set_student_skill_mastery_updated_at on public.student_skill_mastery;
create trigger set_student_skill_mastery_updated_at before update on public.student_skill_mastery
for each row execute function public.handle_updated_at();

drop trigger if exists set_student_void_sessions_updated_at on public.student_void_sessions;
create trigger set_student_void_sessions_updated_at before update on public.student_void_sessions
for each row execute function public.handle_updated_at();
