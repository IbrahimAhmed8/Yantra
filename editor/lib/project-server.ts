import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { createAnonClient, createClient } from '@/src/lib/supabase/server';
import { getEditorProjectTemplate } from './project-templates';
import type {
  EditorProjectDetails,
  EditorProjectFile,
  EditorProjectFileInput,
  EditorProjectSummary,
  EditorTemplateKey,
} from '@/editor/types';

type EditorProjectRow = {
  id: string;
  user_id: string;
  title: string;
  template_key: EditorTemplateKey;
  primary_language: EditorProjectSummary['primaryLanguage'];
  created_at: string;
  updated_at: string;
};

type EditorProjectFileRow = {
  id: string;
  project_id: string;
  path: string;
  language: EditorProjectFile['language'];
  content: string;
  sort_order: number;
  is_entry: boolean;
  created_at: string;
  updated_at: string;
};

type EditorProjectShareRow = {
  id: string;
  project_id: string;
  share_slug: string;
  created_by: string;
  created_at: string;
};

type EditorSupabaseClient = Awaited<ReturnType<typeof createClient>>;
type EditorAuthenticatedUser = {
  id: string;
};

function isMissingSessionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === 'AuthSessionMissingError' || error.message.toLowerCase().includes('auth session missing');
}

function toProjectSummary(row: EditorProjectRow): EditorProjectSummary {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    templateKey: row.template_key,
    primaryLanguage: row.primary_language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProjectFile(row: EditorProjectFileRow): EditorProjectFile {
  return {
    id: row.id,
    projectId: row.project_id,
    path: row.path,
    language: row.language,
    content: row.content,
    sortOrder: row.sort_order,
    isEntry: row.is_entry,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeTitle(title: string | undefined, fallbackTitle: string) {
  const nextTitle = title?.trim();
  return nextTitle && nextTitle.length > 0 ? nextTitle.slice(0, 120) : fallbackTitle;
}

export async function getAuthenticatedEditorContext() {
  if (!hasSupabaseEnv()) {
    throw new Error('Supabase is not configured yet.');
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isMissingSessionError(error)) {
      return null;
    }

    throw error;
  }

  if (!user) {
    return null;
  }

  return {
    supabase,
    user,
  };
}

export function getPublicEditorClient() {
  if (!hasSupabaseEnv()) {
    throw new Error('Supabase is not configured yet.');
  }

  return createAnonClient();
}

export async function listOwnedEditorProjects(supabase: EditorSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('editor_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data as EditorProjectRow[] | null) ?? []).map(toProjectSummary);
}

export async function getOwnedEditorProjectRow(supabase: EditorSupabaseClient, userId: string, projectId: string) {
  const { data, error } = await supabase
    .from('editor_projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EditorProjectRow | null) ?? null;
}

export async function getEditorProjectFiles(supabase: EditorSupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('editor_project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .order('path', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data as EditorProjectFileRow[] | null) ?? []).map(toProjectFile);
}

export async function getOwnedEditorProjectDetails(
  supabase: EditorSupabaseClient,
  userId: string,
  projectId: string,
): Promise<EditorProjectDetails | null> {
  const projectRow = await getOwnedEditorProjectRow(supabase, userId, projectId);

  if (!projectRow) {
    return null;
  }

  return {
    project: toProjectSummary(projectRow),
    files: await getEditorProjectFiles(supabase, projectId),
  };
}

export async function createEditorProjectWithTemplate(
  supabase: EditorSupabaseClient,
  user: EditorAuthenticatedUser,
  templateKey: EditorTemplateKey,
  title?: string,
) {
  const template = getEditorProjectTemplate(templateKey);
  const nextTitle = normalizeTitle(title, template.title);

  const { data: projectData, error: projectError } = await supabase
    .from('editor_projects')
    .insert({
      user_id: user.id,
      title: nextTitle,
      template_key: templateKey,
      primary_language: template.primaryLanguage,
    })
    .select('*')
    .single();

  if (projectError) {
    throw projectError;
  }

  const projectRow = projectData as EditorProjectRow;
  const files = template.files.map((file) => ({
    project_id: projectRow.id,
    path: file.path,
    language: file.language,
    content: file.content,
    sort_order: file.sortOrder,
    is_entry: file.isEntry,
  }));

  const { data: fileData, error: fileError } = await supabase
    .from('editor_project_files')
    .insert(files)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('path', { ascending: true });

  if (fileError) {
    throw fileError;
  }

  return {
    project: toProjectSummary(projectRow),
    files: ((fileData as EditorProjectFileRow[] | null) ?? []).map(toProjectFile),
  } satisfies EditorProjectDetails;
}

export async function updateOwnedEditorProjectTitle(
  supabase: EditorSupabaseClient,
  userId: string,
  projectId: string,
  title: string,
) {
  const projectRow = await getOwnedEditorProjectRow(supabase, userId, projectId);

  if (!projectRow) {
    return null;
  }

  const { data, error } = await supabase
    .from('editor_projects')
    .update({
      title: normalizeTitle(title, projectRow.title),
    })
    .eq('id', projectId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return toProjectSummary(data as EditorProjectRow);
}

export async function replaceOwnedEditorProjectFiles(
  supabase: EditorSupabaseClient,
  userId: string,
  projectId: string,
  files: EditorProjectFileInput[],
) {
  const projectRow = await getOwnedEditorProjectRow(supabase, userId, projectId);

  if (!projectRow) {
    return null;
  }

  const { error: deleteError } = await supabase.from('editor_project_files').delete().eq('project_id', projectId);

  if (deleteError) {
    throw deleteError;
  }

  const { data, error } = await supabase
    .from('editor_project_files')
    .insert(
      files.map((file) => ({
        project_id: projectId,
        path: file.path,
        language: file.language,
        content: file.content,
        sort_order: file.sortOrder,
        is_entry: file.isEntry,
      })),
    )
    .select('*')
    .order('sort_order', { ascending: true })
    .order('path', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data as EditorProjectFileRow[] | null) ?? []).map(toProjectFile);
}

export async function insertEditorProjectShare(
  supabase: EditorSupabaseClient,
  projectId: string,
  createdBy: string,
  shareSlug: string,
) {
  const { data, error } = await supabase
    .from('editor_project_shares')
    .insert({
      project_id: projectId,
      created_by: createdBy,
      share_slug: shareSlug,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as EditorProjectShareRow;
}

export async function getEditorProjectShareBySlug(supabase: EditorSupabaseClient, shareSlug: string) {
  const { data, error } = await supabase
    .from('editor_project_shares')
    .select('*')
    .eq('share_slug', shareSlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EditorProjectShareRow | null) ?? null;
}

export async function getSharedEditorProjectDetails(shareSlug: string): Promise<EditorProjectDetails | null> {
  const supabase = getPublicEditorClient();
  const shareRow = await getEditorProjectShareBySlug(supabase, shareSlug);

  if (!shareRow) {
    return null;
  }

  const { data: projectData, error: projectError } = await supabase
    .from('editor_projects')
    .select('*')
    .eq('id', shareRow.project_id)
    .maybeSingle();

  if (projectError) {
    throw projectError;
  }

  const projectRow = (projectData as EditorProjectRow | null) ?? null;

  if (!projectRow) {
    return null;
  }

  return {
    project: toProjectSummary(projectRow),
    files: await getEditorProjectFiles(supabase, shareRow.project_id),
  };
}
