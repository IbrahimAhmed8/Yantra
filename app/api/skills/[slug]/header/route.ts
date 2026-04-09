import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const supabase = await createClient();

    // Public endpoint - RLS on skills table handles security
    const { data: skill, error: skillError } = await supabase
        .from('skills')
        .select('id, slug, name, description, tagline, track_label, unlock_type')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (skillError) {
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const { count: roomCount } = await supabase
        .from('skill_topics')
        .select('*', { count: 'exact', head: true })
        .eq('skill_id', skill.id)
        .eq('is_active', true);

    // Get completed rooms count - this needs user context
    const { data: { user } } = await supabase.auth.getUser();
    let completedCount = 0;

    if (user) {
        const topicIds = (
            await supabase
                .from('skill_topics')
                .select('id')
                .eq('skill_id', skill.id)
        ).data?.map(t => t.id) || [];

        if (topicIds.length > 0) {
            const { data: progress } = await supabase
                .from('student_topic_progress')
                .select('status')
                .eq('user_id', user.id)
                .in('topic_id', topicIds);

            completedCount = progress?.filter(p => p.status === 'completed').length || 0;
        }
    }

    // Return response matching brief format: name, description, tagline, track_label, unlock_type, room count
    return NextResponse.json({
        name: skill.name,
        description: skill.description,
        tagline: skill.tagline,
        track_label: skill.track_label,
        unlock_type: skill.unlock_type,
        total_rooms: roomCount || 0,
        completed_rooms: completedCount
    });
}
