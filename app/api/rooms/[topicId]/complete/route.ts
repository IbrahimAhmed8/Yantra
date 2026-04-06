import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
    request: Request,
    { params }: { params: { topicId: string } }
) {
    const { topicId } = params;

    // Validate UUID format
    if (!UUID_REGEX.test(topicId)) {
        return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify topic exists and is active before completing
    const { data: topic, error: topicError } = await supabase
        .from('skill_topics')
        .select('id')
        .eq('id', topicId)
        .eq('is_active', true)
        .single();

    if (topicError) {
        return NextResponse.json({ error: 'Topic not found or inactive' }, { status: 404 });
    }

    const { data: result, error: rpcError } = await supabase.rpc('complete_skill_topic', {
        p_topic_id: topicId,
        p_user_id: user.id
    });

    if (rpcError) {
        return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    return NextResponse.json(result);
}
