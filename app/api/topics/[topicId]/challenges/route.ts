import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
    request: Request,
    { params }: { params: { topicId: string } }
) {
    const { topicId } = params;
    const { searchParams } = new URL(request.url);
    
    // Pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 per page
    const offset = (page - 1) * limit;

    // Validate UUID format
    if (!UUID_REGEX.test(topicId)) {
        return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: topic, error: topicError } = await supabase
        .from('skill_topics')
        .select('id, skill_id')
        .eq('id', topicId)
        .single();

    if (topicError) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Get total count for pagination metadata
    const { count: totalCount } = await supabase
        .from('yantra_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicId)
        .eq('is_active', true);

    // Fetch paginated challenges
    const { data: challenges } = await supabase
        .from('yantra_challenges')
        .select('*')
        .eq('topic_id', topicId)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .range(offset, offset + limit - 1);

    if (!challenges || challenges.length === 0) {
        return NextResponse.json({ 
            challenges: [], 
            next: null,
            pagination: { page, limit, total: totalCount || 0, pages: Math.ceil((totalCount || 0) / limit) }
        });
    }

    const { data: topicProgress } = await supabase
        .from('student_topic_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .maybeSingle();

    if (topicProgress?.status === 'completed') {
        return NextResponse.json({ 
            challenges, 
            next: null,
            pagination: { page, limit, total: totalCount || 0, pages: Math.ceil((totalCount || 0) / limit) }
        });
    }

    const { data: challengeProgress } = await supabase
        .from('student_challenge_progress')
        .select('challenge_id, status')
        .eq('user_id', user.id)
        .in('challenge_id', challenges.map(c => c.id));

    const passedIds = new Set(
        challengeProgress
            ?.filter(p => p.status === 'passed')
            .map(p => p.challenge_id) || []
    );

    const nextChallenge = challenges.find(c => !passedIds.has(c.id)) || null;

    return NextResponse.json({
        challenges,
        next: nextChallenge,
        pagination: { page, limit, total: totalCount || 0, pages: Math.ceil((totalCount || 0) / limit) }
    });
}
