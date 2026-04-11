import EditorWorkspace from './EditorWorkspace';
import { defaultStudentProfile } from '@/src/features/dashboard/student-profile-model';
import { buildLocalEditorProject } from '@/editor/lib/local-dev-projects';
import { PUBLIC_EDITOR_USER } from '@/src/lib/public-mode';

type EditorPageProps = {
  searchParams?: Promise<{
    projectId?: string | string[];
  }>;
};

function resolveProjectId(projectId: string | string[] | undefined) {
  if (Array.isArray(projectId)) {
    return projectId[0] ?? null;
  }

  return projectId ?? null;
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialProjectId = resolveProjectId(params?.projectId);
  const initialProjectDetails =
    initialProjectId === null
      ? buildLocalEditorProject({
          projectId: 'local-dev-python-playground',
          userId: PUBLIC_EDITOR_USER.id,
          templateKey: 'python-playground',
          timestamp: '2026-04-06T00:00:00.000Z',
        })
      : null;

  return (
    <EditorWorkspace
      authedUser={PUBLIC_EDITOR_USER}
      profile={defaultStudentProfile}
      initialProjectId={initialProjectId ?? initialProjectDetails?.project.id ?? null}
      initialProjectDetails={initialProjectDetails}
      devBypass
    />
  );
}
