import { NextResponse } from 'next/server';
import { getSharedEditorProjectDetails } from '@/editor/lib/project-server';

type ShareRouteContext = {
  params: Promise<{
    shareSlug: string;
  }>;
};

async function readShareSlug(params: ShareRouteContext['params']) {
  const resolvedParams = await params;
  return resolvedParams.shareSlug;
}

export async function GET(_request: Request, { params }: ShareRouteContext) {
  try {
    const shareSlug = await readShareSlug(params);
    const projectDetails = await getSharedEditorProjectDetails(shareSlug);

    if (!projectDetails) {
      return NextResponse.json({ error: 'Shared editor project not found.' }, { status: 404 });
    }

    return NextResponse.json(projectDetails);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load the shared editor project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
