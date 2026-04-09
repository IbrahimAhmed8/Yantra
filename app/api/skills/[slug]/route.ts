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
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (skillError) {
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json(skill);
}
