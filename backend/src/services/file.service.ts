// this file contains the logic for handling all direct communication with the Supabase client.

import { supabase } from '../config/supabase';
import { FileMetadata } from '../types/file';

export const FileService = {
    async listFiles(userId: string) {
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    },

    async saveFile(fileData: FileMetadata) {
        const { data, error } = await supabase
            .from('files')
            .insert([fileData])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getFileById(fileId: string, userId: string) {
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .eq('user_id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async deleteFile(fileId: string, userId: string) {
        const { error } = await supabase
            .from('files')
            .delete()
            .eq('id', fileId)
            .eq('user_id', userId);
        if (error) throw error;
        return true;
    }
};
