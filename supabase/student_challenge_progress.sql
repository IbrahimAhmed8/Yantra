-- Tracking individual task success for students

CREATE TABLE IF NOT EXISTS public.student_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    challenge_id UUID REFERENCES public.yantra_challenges (id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (
        status IN (
            'passed',
            'failed',
            'attempted'
        )
    ) DEFAULT 'attempted',
    code_submission TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, challenge_id)
);

-- Enable Row Level Security
ALTER TABLE public.student_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view and update their own submissions
CREATE POLICY "Users can view/update own challenge progress" ON public.student_challenge_progress FOR ALL USING (auth.uid () = user_id);

-- Apply updated_at trigger
-- Note: This assumes the public.handle_updated_at() function exists in your database
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_student_challenge_progress_updated_at') THEN
        CREATE TRIGGER set_student_challenge_progress_updated_at 
        BEFORE UPDATE ON public.student_challenge_progress 
        FOR EACH ROW 
        EXECUTE FUNCTION public.handle_updated_at();

END IF;

END $$;