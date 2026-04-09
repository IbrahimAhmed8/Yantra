import { createClient } from './server';

export type PythonRoomRecord = {
    id: string;
    slug: string;
    topic: string;
    difficulty: number;
    blueprint: any; // Matches RoomBlueprint type
};

export async function getPythonRoomBySlug(slug: string): Promise<PythonRoomRecord | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('python_rooms')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

    if (error || !data) {
        return null;
    }

    return data as PythonRoomRecord;
}