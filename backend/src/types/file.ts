export interface FileMetadata {
    id?: string;
    user_id: string;
    storage_path: string;
    filename: string;
    file_type: string;
    size_bytes: number;
    created_at?: string;
}
