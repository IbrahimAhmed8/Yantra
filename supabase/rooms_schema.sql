-- Phase 1: Database Schema & Security (SQL Layer)
-- Implementation for Yantra Rooms System

-- 1. Skills Table (The Courses)
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    tagline TEXT,
    track_label TEXT, -- e.g., "BEGINNER TRACK"
    unlock_type TEXT, -- e.g., "SEQUENTIAL UNLOCK"
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Skill Topics Table (The Rooms)
CREATE TABLE IF NOT EXISTS public.skill_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    skill_id UUID REFERENCES public.skills (id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT, -- One-line description for the card
    objective TEXT, -- Full text for the detail panel
    practice_description TEXT,
    estimated_minutes INTEGER,
    level_label TEXT, -- e.g., "Entry"
    reward_label TEXT, -- e.g., "Live room"
    unlock_condition_text TEXT, -- e.g., "Live now"
    room_type TEXT CHECK (
        room_type IN (
            'live',
            'standard',
            'milestone'
        )
    ),
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Unique constraint to support ON CONFLICT logic in seeding and APIs
    UNIQUE (skill_id, slug)
);

-- Indexing for efficient sequential unlocking and room listing
CREATE INDEX IF NOT EXISTS idx_skill_topics_skill_order ON public.skill_topics (skill_id, order_index);

-- 3. Yantra Challenges Table (Coding Problems)
CREATE TABLE IF NOT EXISTS public.yantra_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.skill_topics(id) ON DELETE CASCADE,
    blueprint_key TEXT,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    task TEXT NOT NULL,
    starter_code TEXT,
    hints TEXT[] DEFAULT '{}',
    expected_output TEXT,
    estimated_minutes INTEGER,
    difficulty_score INTEGER CHECK (difficulty_score BETWEEN 1 AND 5),
    language TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Student Topic Progress Table (Tracking)
CREATE TABLE IF NOT EXISTS public.student_topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.skill_topics (id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (
        status IN (
            'locked',
            'available',
            'current',
            'completed'
        )
    ) DEFAULT 'locked',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Unique constraint to ensure one row per student per room
    UNIQUE (user_id, topic_id)
);
-- --- Row Level Security (RLS) ---

-- Ensure columns and constraints exist if tables were already created by previous scripts
DO $$ 
BEGIN 
    -- 1. Skills updates
    ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure skills.slug is unique for ON CONFLICT (slug)
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'skills_slug_key'
) THEN
ALTER TABLE public.skills
ADD CONSTRAINT skills_slug_key UNIQUE (slug);

END IF;

-- 2. Skill Topics updates
ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS objective TEXT;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS practice_description TEXT;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS level_label TEXT;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS reward_label TEXT;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS unlock_condition_text TEXT;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS room_type TEXT;

ALTER TABLE public.skill_topics
ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- Ensure unique constraint exists for ON CONFLICT (skill_id, slug)
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'skill_topics_skill_id_slug_key'
) THEN
ALTER TABLE public.skill_topics
ADD CONSTRAINT skill_topics_skill_id_slug_key UNIQUE (skill_id, slug);

END IF;

-- 3. Yantra Challenges updates
ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
-- Ensure the topic_id column exists for linking to skill_topics
ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.skill_topics (id) ON DELETE CASCADE;
-- Make the original 'description' column nullable as 'task' is the new primary description
ALTER TABLE public.yantra_challenges
ALTER COLUMN description
DROP NOT NULL;
-- Ensure 'difficulty' from the old schema is handled (it's already there, but we map difficulty_score to it)
-- No explicit ALTER needed for 'difficulty' itself, as it's already defined as NOT NULL in schema.sql
ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS blueprint_key TEXT;

ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS order_index INTEGER;

ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS task TEXT;

ALTER TABLE public.yantra_challenges ADD COLUMN IF NOT EXISTS hints TEXT[] DEFAULT '{}';

ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS expected_output TEXT;

ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER;

ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS difficulty_score INTEGER;

ALTER TABLE public.yantra_challenges
ADD COLUMN IF NOT EXISTS language TEXT;

-- Ensure unique constraint on challenges to prevent index collision
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE
        conname = 'yantra_challenges_topic_id_order_index_key'
) THEN
ALTER TABLE public.yantra_challenges
ADD CONSTRAINT yantra_challenges_topic_id_order_index_key UNIQUE (topic_id, order_index);

END IF;

END $$;

-- Enable RLS on all tables
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.skill_topics ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.yantra_challenges ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_topic_progress ENABLE ROW LEVEL SECURITY;

-- Skills Policy: Public Read for active skills
CREATE POLICY "Allow public read for active skills" ON public.skills FOR
SELECT USING (is_active = true);

-- Skill Topics Policy: Public Read for active topics
CREATE POLICY "Allow public read for active topics" ON public.skill_topics FOR
SELECT USING (is_active = true);

-- Yantra Challenges Policy: Public Read for active challenges
CREATE POLICY "Allow public read for active challenges" ON public.yantra_challenges FOR
SELECT USING (is_active = true);

-- Student Topic Progress Policy: Users can only see/update their own data
CREATE POLICY "Users can view own progress" ON public.student_topic_progress FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can update own progress" ON public.student_topic_progress FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own progress" ON public.student_topic_progress FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Note: The logic for "Auto-seeding" progress rows will be handled
-- in the API layer (Phase 2), ensuring that when a student fetches rooms,
-- the first room is marked as 'current' if no records exist.

-- --- RPC Functions ---

-- Logic for atomic room completion and unlocking next room
CREATE OR REPLACE FUNCTION public.complete_skill_topic(p_topic_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_skill_id UUID;
    v_order_index INTEGER;
    v_next_topic_id UUID;
BEGIN
    -- 1. Mark current topic as completed
    UPDATE public.student_topic_progress
    SET status = 'completed',
        completed_at = now()
    WHERE topic_id = p_topic_id AND user_id = p_user_id;

    -- 2. Get current topic metadata to find the successor
    SELECT skill_id, order_index INTO v_skill_id, v_order_index
    FROM public.skill_topics
    WHERE id = p_topic_id;

    -- 3. Identify the next topic in sequence
    SELECT id INTO v_next_topic_id
    FROM public.skill_topics
    WHERE skill_id = v_skill_id AND order_index = v_order_index + 1;

    -- 4. Unlock next topic if it exists
    IF v_next_topic_id IS NOT NULL THEN
        UPDATE public.student_topic_progress
        SET status = 'current'
        WHERE topic_id = v_next_topic_id AND user_id = p_user_id;
        
        RETURN jsonb_build_object('success', true, 'nextTopicId', v_next_topic_id);
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Skill track fully completed');
END;
$$;