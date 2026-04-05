import { createClient } from '@/src/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
        const { skill_key, quizzes_passed, void_challenges_passed } = body;

        if (!skill_key || quizzes_passed === undefined || void_challenges_passed === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: skill_key, quizzes_passed, void_challenges_passed' },
                { status: 400 }
            );
        }

        const qPassed = Number(quizzes_passed);
        const vPassed = Number(void_challenges_passed);

        if (isNaN(qPassed) || isNaN(vPassed)) {
            return NextResponse.json({ error: 'Progress counts must be numbers' }, { status: 400 });
        }

        // Formula: (quizzes_passed × 0.4) + (void_challenges_passed × 0.6)
        // Capped at 100 as per requirements.
        const rawScore = qPassed * 0.4 + vPassed * 0.6;
        const mastery_score = Math.min(100, Math.max(0, Math.round(rawScore)));

        const { data, error: dbError } = await supabase
            .from('student_skill_mastery')
            .upsert(
                {
                    user_id: user.id,
                    skill_key,
                    quizzes_passed: qPassed,
                    void_challenges_passed: vPassed,
                    mastery_score,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,skill_key' }
            )
            .select()
            .single();

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            mastery: data,
        });
    } catch (error) {
        console.error('[MASTERY_UPDATE_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}