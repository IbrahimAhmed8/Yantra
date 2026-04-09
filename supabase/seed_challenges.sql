-- Phase 5: Challenge Seeding for Yantra Rooms System
-- This script seeds the coding tasks for the first two Python rooms.

DO $$
DECLARE
    v_topic_id UUID;
    v_skill_key TEXT;
    v_topic_slug TEXT;
BEGIN
    -- ---------------------------------------------------------
    -- ROOM 01: Control Flow Calibration (if/else basics)
    -- ---------------------------------------------------------
    SELECT st.id, s.slug, st.slug INTO v_topic_id, v_skill_key, v_topic_slug
    FROM public.skill_topics st
    JOIN public.skills s ON st.skill_id = s.id
    WHERE st.slug = 'control-flow-calibration';

    IF v_topic_id IS NOT NULL THEN
        INSERT INTO public.yantra_challenges (
            topic_id, blueprint_key, order_index, title, task, 
            starter_code, hints, expected_output, 
            estimated_minutes, difficulty_score, language,
            skill_key, topic, description, difficulty -- Added skill_key, topic, description, difficulty
        )
        VALUES
        (
            v_topic_id, 'python-beginner-if-01', 1, 'The Temperature Check',
            'Create a variable called "temp" and set it to 30. Write an if statement: if temp is greater than 25, print "It is hot!".',
            'temp = 30\n# Write your if statement below\n',
            ARRAY['Remember to use a colon (:) at the end of your if statement.', 'Indentation matters in Python!'], 'It is hot!', 5, 1, 'python', v_skill_key, v_topic_slug, 'Create a variable called "temp" and set it to 30. Write an if statement: if temp is greater than 25, print "It is hot!".', 1 -- Values for skill_key, topic, description, difficulty
        ),
        (
            v_topic_id, 'python-beginner-if-01', 2, 'Password Security',
            'A user provided the password "yantra123". Write an if/else block: if the password is "yantra123", print "Access Granted", otherwise print "Access Denied".',
            'password = "yantra123"\n',
            ARRAY['Use the == operator to check for equality.', 'The else block also needs a colon.'],
            'Access Granted', 7, 2, 'python'
            , v_skill_key, v_topic_slug, 'A user provided the password "yantra123". Write an if/else block: if the password is "yantra123", print "Access Granted", otherwise print "Access Denied".', 2 -- Values for skill_key, topic, description, difficulty
        )
        ON CONFLICT DO NOTHING;
    END IF;

    -- ---------------------------------------------------------
    -- ROOM 02: Variables and Output (storage and display)
    -- ---------------------------------------------------------
    SELECT st.id, s.slug, st.slug INTO v_topic_id, v_skill_key, v_topic_slug
    FROM public.skill_topics st
    JOIN public.skills s ON st.skill_id = s.id
    WHERE st.slug = 'variables-and-output';

    IF v_topic_id IS NOT NULL THEN
        INSERT INTO public.yantra_challenges (
            topic_id, blueprint_key, order_index, title, task, 
            starter_code, hints, expected_output, 
            estimated_minutes, difficulty_score, language,
            skill_key, topic, description, difficulty -- Added skill_key, topic, description, difficulty
        )
        VALUES
        (
            v_topic_id, 'python-beginner-vars-01', 1, 'The Flight Tracker',
            'Create a variable named "destination" and set it to "Lagos". Then print exactly: "Your flight to Lagos is ready."',
            '# Define your variable below\n',
            ARRAY['Make sure the string "Lagos" is capitalized correctly.', 'Use the variable inside your print statement.'], 'Your flight to Lagos is ready', 5, 1, 'python', v_skill_key, v_topic_slug, 'Create a variable named "destination" and set it to "Lagos". Then print exactly: "Your flight to Lagos is ready."', 1 -- Values for skill_key, topic, description, difficulty
        ),
        (
            v_topic_id, 'python-beginner-vars-01', 2, 'The Scoreboard',
            'Create two variables: "player" set to "Asha" and "score" set to 100. Print the player name and the score on separate lines.',
            '# Define variables and print them\n',
            ARRAY['You can call print() twice.', 'Variables dont need quotes around them.'],
            'Asha\n100', 8, 2, 'python'
            , v_skill_key, v_topic_slug, 'Create two variables: "player" set to "Asha" and "score" set to 100. Print the player name and the score on separate lines.', 2 -- Values for skill_key, topic, description, difficulty
        )
        ON CONFLICT DO NOTHING;
    END IF;

END $$;

-- Verification Query
-- Run this to ensure challenges are correctly linked to rooms
-- SELECT
--     t.name as room_name,
--     c.title as challenge_title,
--     c.order_index
-- FROM public.skill_topics t
-- JOIN public.yantra_challenges c ON t.id = c.topic_id
-- WHERE t.slug IN ('control-flow-calibration', 'variables-and-output')
-- ORDER BY t.order_index, c.order_index;