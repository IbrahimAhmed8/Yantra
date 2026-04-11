import { NextResponse } from 'next/server';
import { replaceOwnedEditorProjectFiles, getAuthenticatedEditorContext } from '@/editor/lib/project-server';
import type { EditorFileLanguage, EditorProjectFileInput } from '@/editor/types';

type ProjectFilesRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

type IncomingProjectFile = {
  path?: unknown;
  language?: unknown;
  content?: unknown;
  sort_order?: unknown;
  sortOrder?: unknown;
  is_entry?: unknown;
  isEntry?: unknown;
};

const VALID_FILE_LANGUAGES: EditorFileLanguage[] = [
  'python',
  'javascript',
  'typescript',
  'html',
  'css',
  'json',
  'markdown',
  'plaintext',
];

function isEditorFileLanguage(value: unknown): value is EditorFileLanguage {
  return typeof value === 'string' && VALID_FILE_LANGUAGES.includes(value as EditorFileLanguage);
}

function normalizeProjectFiles(input: unknown): EditorProjectFileInput[] | null {
  if (!Array.isArray(input) || input.length === 0) {
    return null;
  }

  const normalizedFiles: EditorProjectFileInput[] = [];

  for (const candidate of input) {
    const file = candidate as IncomingProjectFile;
    const path = typeof file.path === 'string' ? file.path.trim() : '';
    const language = file.language;
    const content = typeof file.content === 'string' ? file.content : '';
    const rawSortOrder = typeof file.sort_order === 'number' ? file.sort_order : file.sortOrder;
    const sortOrder = Number.isInteger(rawSortOrder) ? Number(rawSortOrder) : null;
    const isEntry = typeof file.is_entry === 'boolean' ? file.is_entry : typeof file.isEntry === 'boolean' ? file.isEntry : null;

    if (!path || !isEditorFileLanguage(language) || sortOrder === null || isEntry === null) {
      return null;
    }

    normalizedFiles.push({
      path,
      language,
      content,
      sortOrder,
      isEntry,
    });
  }

  return normalizedFiles;
}

async function readProjectId(params: ProjectFilesRouteContext['params']) {
  const resolvedParams = await params;
  return resolvedParams.projectId;
}

export async function PUT(request: Request, { params }: ProjectFilesRouteContext) {
  try {
    const context = await getAuthenticatedEditorContext();

    if (!context) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as unknown;
    const files = normalizeProjectFiles(body);

    if (!files) {
      return NextResponse.json({ error: 'Expected a non-empty array of editor project files.' }, { status: 400 });
    }

    const entryFileCount = files.filter((file) => file.isEntry).length;

    if (entryFileCount !== 1) {
      return NextResponse.json({ error: 'Exactly one editor file must be marked as the entry file.' }, { status: 400 });
    }

    const projectId = await readProjectId(params);
    const savedFiles = await replaceOwnedEditorProjectFiles(context.supabase, context.user.id, projectId, files);

    if (!savedFiles) {
      return NextResponse.json({ error: 'Editor project not found.' }, { status: 404 });
    }

    return NextResponse.json({ files: savedFiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save editor project files.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
