-- Phase 4: Data Seeding for Yantra Rooms System
-- This script inserts the initial 'Python Foundations' skill and its topics (rooms).

-- Declare a variable to hold the skill_id for Python Foundations
DO $$
DECLARE
    python_skill_id UUID;
BEGIN
    -- Insert the 'Python Foundations' skill
    INSERT INTO public.skills (slug, name, description, tagline, unlock_type, is_active, order_index)
    VALUES (
        'python',
        'Python Foundations',
        'A clean beginner path for syntax, logic, and readable problem solving. Enter the live room, then unlock the rest one chapter at a time.',
        'BEGINNER TRACK',
        'SEQUENTIAL UNLOCK',
        TRUE,
        1
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        tagline = EXCLUDED.tagline,
        unlock_type = EXCLUDED.unlock_type,
        is_active = EXCLUDED.is_active,
        order_index = EXCLUDED.order_index
    RETURNING id INTO python_skill_id;

    -- Insert the skill_topics (rooms) for 'Python Foundations'
    INSERT INTO public.skill_topics (
        skill_id, slug, name, description, objective, practice_description,
        estimated_minutes, level_label, reward_label, unlock_condition_text,
        room_type, order_index, is_active
    )
    VALUES
    (
        python_skill_id, 'control-flow-calibration', 'Control Flow Calibration', 'Master the basics of conditional logic.', 'Understand and apply if/else statements to control program flow.', 'Practice writing Python code that uses if/else statements to make decisions.',
        18, 'Entry', 'Live room', 'Live now',
        'live', 1, TRUE
    ),
    (
        python_skill_id, 'variables-and-output', 'Variables and Output', 'Learn to store data and display it.', 'Grasp how to declare variables and use print() for output.', 'Write Python scripts to declare variables of different types and print their values.',
        20, 'Entry', 'Standard room', 'Complete Room 01',
        'standard', 2, TRUE
    ),
    (
        python_skill_id, 'loops-and-collections', 'Loops and Collections', 'Iterate over data structures efficiently.', 'Explore for and while loops, and work with lists and tuples.', 'Implement loops to process elements within lists and other collections.',
        25, 'Entry', 'Standard room', 'Complete Room 02',
        'standard', 3, TRUE
    ),
    (
        python_skill_id, 'functions-and-reuse', 'Functions and Reuse', 'Organize code into reusable blocks.', 'Define and call functions, understanding parameters and return values.', 'Create functions to encapsulate logic and reuse them across different parts of your program.',
        30, 'Intermediate', 'Standard room', 'Complete Room 03',
        'standard', 4, TRUE
    ),
    (
        python_skill_id, 'learner-scoreboard', 'Practice Challenge: Learner Scoreboard', 'Apply all learned concepts in a practical project.', 'Build a simple scoreboard application using variables, control flow, loops, and functions.', 'Develop a Python program that simulates a learner scoreboard, tracking points and displaying ranks.',
        45, 'Intermediate', 'Milestone project', 'Complete Room 04',
        'milestone', 5, TRUE
    )
    ON CONFLICT (skill_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        objective = EXCLUDED.objective,
        practice_description = EXCLUDED.practice_description,
        estimated_minutes = EXCLUDED.estimated_minutes,
        level_label = EXCLUDED.level_label,
        reward_label = EXCLUDED.reward_label,
        unlock_condition_text = EXCLUDED.unlock_condition_text,
        room_type = EXCLUDED.room_type,
        order_index = EXCLUDED.order_index,
        is_active = EXCLUDED.is_active;
END $$;