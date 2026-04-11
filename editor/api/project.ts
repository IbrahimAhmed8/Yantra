import { NextResponse } from 'next/server';
import {
  getAuthenticatedEditorContext,
  getOwnedEditorProjectDetails,
  updateOwnedEditorProjectTitle,
} from '@/editor/lib/project-server';

type ProjectRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

type UpdateProjectBody = {
  title?: string;
};

async function readProjectId(params: ProjectRouteContext['params']) {
  const resolvedParams = await params;
  return resolvedParams.projectId;
}

export async function GET(_request: Request, { params }: ProjectRouteContext) {
  try {
    const context = await getAuthenticatedEditorContext();

    if (!context) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const projectId = await readProjectId(params);
    const projectDetails = await getOwnedEditorProjectDetails(context.supabase, context.user.id, projectId);

    if (!projectDetails) {
      return NextResponse.json({ error: 'Editor project not found.' }, { status: 404 });
    }

    return NextResponse.json(projectDetails);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load editor project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: ProjectRouteContext) {
  try {
    const context = await getAuthenticatedEditorContext();

    if (!context) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as UpdateProjectBody;
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json({ error: 'A project title is required.' }, { status: 400 });
    }

    const projectId = await readProjectId(params);
    const updatedProject = await updateOwnedEditorProjectTitle(context.supabase, context.user.id, projectId, title);

    if (!updatedProject) {
      return NextResponse.json({ error: 'Editor project not found.' }, { status: 404 });
    }

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update editor project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
