import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
    request: Request,
    { params }: { params: { topicId: string } }
) {
    const { topicId } = params;

    // Validate UUID format
    if (!UUID_REGEX.test(topicId)) {
        return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }

    const supabase = await createClient();

    // Public endpoint - RLS on skill_topics handles security
    const { data: topic, error: topicError } = await supabase
        .from('skill_topics')
        .select('*')
        .eq('id', topicId)
        .eq('is_active', true)
        .single();

    if (topicError) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Get user status only if authenticated
    let userStatus = null;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: progress } = await supabase
            .from('student_topic_progress')
            .select('status')
            .eq('user_id', user.id)
            .eq('topic_id', topicId)
            .maybeSingle();

        userStatus = progress?.status || 'locked';
    }

    return NextResponse.json({
        ...topic,
        user_status: userStatus
    });
}
