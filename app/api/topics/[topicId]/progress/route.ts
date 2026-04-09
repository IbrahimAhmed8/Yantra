import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ topicId: string }> }
) {
    const { topicId } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(topicId)) {
        return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: progress, error: progressError } = await supabase
        .from('student_topic_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .maybeSingle();

    if (progressError) {
        return NextResponse.json({ error: progressError.message }, { status: 500 });
    }

    if (!progress) {
        return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
    }

    return NextResponse.json(progress);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ topicId: string }> }
) {
    const { topicId } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(topicId)) {
        return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Only allow 'current' to start a room
    if (!status || !['current'].includes(status)) {
        return NextResponse.json({ 
            error: 'Invalid status. Use POST /api/rooms/:topicId/complete to finish a room.' 
        }, { status: 400 });
    }

    const updateData: Record<string, any> = { status, started_at: new Date().toISOString() };

    const { data: topic, error: topicError } = await supabase
        .from('skill_topics')
        .select('id, skill_id, order_index')
        .eq('id', topicId)
        .single();

    if (topicError) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const { data: currentProgress } = await supabase
        .from('student_topic_progress')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .maybeSingle();

    if (!currentProgress) {
        return NextResponse.json({ error: 'Progress not initialized' }, { status: 404 });
    }

    if (currentProgress.status !== 'available' && currentProgress.status !== 'locked') {
        return NextResponse.json({ 
            error: `Cannot start room. Current status is ${currentProgress.status}` 
        }, { status: 400 });
    }

    const { data: updatedProgress, error: updateError } = await supabase
        .from('student_topic_progress')
        .update(updateData)
        .eq('id', currentProgress.id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedProgress);
}
