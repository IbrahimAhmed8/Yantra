import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    const { slug } = params;
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

    const { data: user } = await supabase.auth.getUser();

    const fetchTopics = async () => {
        return await supabase
            .from('skill_topics')
            .select(`
                *,
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
    if (user) {
        const hasProgress = topics?.some(t => t.student_topic_progress && t.student_topic_progress.length > 0);

        if (!hasProgress && topics && topics.length > 0) {
            const progressInserts = topics.map((topic, index) => ({
                user_id: user.id,
                topic_id: topic.id,
                status: index === 0 ? 'current' : 'locked'
            }));

            // Fix: Use upsert with onConflict to prevent race condition
            // If another request seeds first, this will be ignored (no error)
            const { error: seedError } = await supabase
                .from('student_topic_progress')
                .upsert(progressInserts, { onConflict: 'user_id,topic_id', ignoreDuplicates: true });

            // Regardless of seed error (likely duplicate), refetch to get the latest state
            const { data: reseededTopics } = await fetchTopics();
            if (reseededTopics) {
                topics = reseededTopics;
            }
        }
    }

    return NextResponse.json(topics);
}
