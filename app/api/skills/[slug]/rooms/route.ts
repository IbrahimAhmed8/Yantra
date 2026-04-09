import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    
    // Validate slug format (alphanumeric, hyphens, underscores)
    if (!/^[a-z0-9-_]+$/i.test(slug)) {
        return NextResponse.json({ error: 'Invalid skill slug' }, { status: 400 });
    }
    
    const supabase = await createClient();

    // Public endpoint - RLS on skills/skill_topics handles security
    const { data: skill, error: skillError } = await supabase
        .from('skills')
        .select('id')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (skillError) {
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    const fetchTopics = async () => {
        return await supabase
            .from('skill_topics')
            .select(`
                id, slug, name, description, room_type, order_index,
                student_topic_progress(id, status, started_at, completed_at)
            `)
            .eq('skill_id', skill.id)
            .eq('is_active', true)
            .order('order_index', { ascending: true });
    };

    let { data: topics, error: topicsError } = await fetchTopics();

    if (topicsError) {
        return NextResponse.json({ error: topicsError.message }, { status: 500 });
    }

    // Auto-provisioning only for authenticated users
    if (user && topics) {
        const hasProgress = topics.some(t => t.student_topic_progress && t.student_topic_progress.length > 0);

        if (!hasProgress && topics.length > 0) {
            const progressInserts = topics.map((topic, index) => ({
                user_id: user.id,
                topic_id: topic.id,
                status: index === 0 ? 'current' : 'locked'
            }));

            await supabase
                .from('student_topic_progress')
                .upsert(progressInserts, { onConflict: 'user_id,topic_id', ignoreDuplicates: true });

            // Refetch to get the latest state
            const { data: reseededTopics } = await fetchTopics();
            if (reseededTopics) {
                topics = reseededTopics;
            }
        }
    }

    // Transform response to include status at top level for easier frontend consumption
    const rooms = topics?.map(topic => ({
        room_number: topic.order_index,
        name: topic.name,
        description: topic.description,
        room_type: topic.room_type,
        status: topic.student_topic_progress?.[0]?.status || 'locked'
    })) || [];

    return NextResponse.json({
        rooms,
        total: rooms.length
    });
}
