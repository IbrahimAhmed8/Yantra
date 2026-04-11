import { NextResponse } from 'next/server';
import { createEditorProjectWithTemplate, getAuthenticatedEditorContext, listOwnedEditorProjects } from '@/editor/lib/project-server';
import { isEditorTemplateKey } from '@/editor/lib/project-templates';

type CreateProjectBody = {
  templateKey?: string;
  template_key?: string;
  title?: string;
};

export async function GET() {
  try {
    const context = await getAuthenticatedEditorContext();

    if (!context) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const projects = await listOwnedEditorProjects(context.supabase, context.user.id);

    return NextResponse.json({ projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load editor projects.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAuthenticatedEditorContext();

    if (!context) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as CreateProjectBody;
    const requestedTemplateKey = body.templateKey ?? body.template_key ?? 'python-playground';

    if (!isEditorTemplateKey(requestedTemplateKey)) {
      return NextResponse.json({ error: 'Invalid editor project template.' }, { status: 400 });
    }

    const projectDetails = await createEditorProjectWithTemplate(
      context.supabase,
      context.user,
      requestedTemplateKey,
      body.title,
    );

    return NextResponse.json(projectDetails, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create editor project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
