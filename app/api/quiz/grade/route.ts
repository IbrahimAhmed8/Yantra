import { createClient } from '@/src/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer_index: number;
    explanation: string;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { quiz_id, answers } = body;

        if (!quiz_id || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Missing required fields: quiz_id and answers' },
                { status: 400 }
            );
        }

        // 1. Fetch the official quiz content from the bank
        const { data: quiz, error: quizError } = await supabase
            .from('yantra_quiz_bank')
            .select('content, skill_key')
            .eq('id', quiz_id)
            .single();

        if (quizError || !quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        const quizContent = quiz.content as QuizQuestion[];
        let correctCount = 0;
        const wrongAnswerExplanations: any[] = [];

        // 2. Grade the submission
        answers.forEach((ans: { question_index: number; selected_answer_index: number }) => {
            const question = quizContent[ans.question_index];
            if (question) {
                if (question.correct_answer_index === ans.selected_answer_index) {
                    correctCount++;
                } else {
                    wrongAnswerExplanations.push({
                        question_index: ans.question_index,
                        question_text: question.question,
                        correct_answer: question.options[question.correct_answer_index],
                        your_answer: question.options[ans.selected_answer_index] || 'None selected',
                        explanation: question.explanation,
                    });
                }
            }
        });

        const score = Math.round((correctCount / quizContent.length) * 100);
        const passed = score >= 70; // 70% passing threshold

        // 3. Save the quiz result
        const { error: saveError } = await supabase.from('student_quiz_results').insert({
            user_id: user.id,
            quiz_id,
            skill_key: quiz.skill_key,
            score,
            passed,
            answers,
        });

        if (saveError) throw saveError;

        // 4. Call the mastery update flow (Internal call)
        if (passed) {
            const { data: currentMastery } = await supabase
                .from('student_skill_mastery')
                .select('quizzes_passed, void_challenges_passed')
                .eq('user_id', user.id)
                .eq('skill_key', quiz.skill_key)
                .maybeSingle();

            const quizzesPassed = (currentMastery?.quizzes_passed || 0) + 1;
            const voidPassed = currentMastery?.void_challenges_passed || 0;

            const updateUrl = new URL('/api/skill/update', request.url);
            await fetch(updateUrl.toString(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
                body: JSON.stringify({ skill_key: quiz.skill_key, quizzes_passed: quizzesPassed, void_challenges_passed: voidPassed }),
            });
        }

        return NextResponse.json({ score, passed, explanations: wrongAnswerExplanations });
    } catch (error) {
        console.error('[QUIZ_GRADE_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
