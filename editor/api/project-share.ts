import { NextResponse } from 'next/server';
import {
  getAuthenticatedEditorContext,
  getOwnedEditorProjectRow,
  insertEditorProjectShare,
} from '@/editor/lib/project-server';
import { createShareSlug } from '@/editor/lib/share-slug';

type ProjectShareRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

function isUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String(error.code ?? '') : '';
  const message = 'message' in error ? String(error.message ?? '').toLowerCase() : '';

  return code === '23505' || message.includes('duplicate key');
}

async function readProjectId(params: ProjectShareRouteContext['params']) {
  const resolvedParams = await params;
  return resolvedParams.projectId;
}

export async function POST(request: Request, { params }: ProjectShareRouteContext) {
  try {
    const context = await getAuthenticatedEditorContext();

    if (!context) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const projectId = await readProjectId(params);
    const project = await getOwnedEditorProjectRow(context.supabase, context.user.id, projectId);

    if (!project) {
      return NextResponse.json({ error: 'Editor project not found.' }, { status: 404 });
    }

    let shareSlug = '';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      shareSlug = createShareSlug();

      try {
        await insertEditorProjectShare(context.supabase, projectId, context.user.id, shareSlug);
        break;
      } catch (error) {
        if (attempt === 4 || !isUniqueConstraintError(error)) {
          throw error;
        }
      }
    }

    const shareUrl = new URL(`/editor/share/${shareSlug}`, request.url).toString();

    return NextResponse.json({
      shareSlug,
      shareUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create a share link.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
