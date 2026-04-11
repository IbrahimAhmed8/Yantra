'use client';

import { startTransition, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, LoaderCircle, Sparkles } from 'lucide-react';
import ProjectCodeEditor from '@/editor/components/ProjectCodeEditor';
import { createLocalEditorProject, saveLocalEditorProject } from '@/editor/lib/local-dev-projects';
import type { EditorProjectFile, EditorProjectSummary } from '@/editor/types';
import { PUBLIC_EDITOR_USER } from '@/src/lib/public-mode';

type SharedProjectViewProps = {
  project: EditorProjectSummary;
  files: EditorProjectFile[];
};

export default function SharedProjectView({ project, files }: SharedProjectViewProps) {
  const router = useRouter();
  const [remixLoading, setRemixLoading] = useState(false);
  const [remixError, setRemixError] = useState<string | null>(null);
  const entryFile = useMemo(() => files.find((file) => file.isEntry) ?? files[0] ?? null, [files]);

  async function handleRemix() {
    setRemixLoading(true);
    setRemixError(null);

    try {
      const localProject = createLocalEditorProject(project.templateKey, PUBLIC_EDITOR_USER.id, `${project.title} Remix`);
      const timestamp = new Date().toISOString();

      saveLocalEditorProject({
        project: {
          ...localProject.project,
          title: `${project.title} Remix`,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        files: files.map((file, index) => ({
          ...file,
          id: `local-file-${localProject.project.id}-${index}`,
          projectId: localProject.project.id,
          createdAt: timestamp,
          updatedAt: timestamp,
        })),
      });

      startTransition(() => {
        router.push(`/editor?projectId=${localProject.project.id}`);
      });
    } catch (error) {
      setRemixError(error instanceof Error ? error.message : 'Unable to remix this project right now.');
      setRemixLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-5 text-white selection:bg-white selection:text-black sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#040404]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.05),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,transparent_78%,rgba(255,255,255,0.03))]" />
      </div>

      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-[24px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/62">
              <Sparkles className="h-3.5 w-3.5" />
              Shared Project
            </div>
            <h1 className="mt-4 font-display text-[3rem] leading-[0.9] tracking-tight text-white">{project.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/58">
              Read-only preview of the shared entry file. Remix it into your local editor to keep editing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/editor/projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              Projects
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-black transition-transform hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => {
                void handleRemix();
              }}
              disabled={remixLoading}
            >
              {remixLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Remix This Project
            </button>
          </div>
        </header>

        {remixError ? (
          <div className="mt-5 rounded-[1.5rem] border border-rose-300/18 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {remixError}
          </div>
        ) : null}

        <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03] p-4 shadow-[0_20px_64px_rgba(0,0,0,0.28)] backdrop-blur-[24px] sm:p-5">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">
            {entryFile?.path ?? 'Entry file'}
          </div>
          <div className="h-[34rem]">
            <ProjectCodeEditor
              file={
                entryFile
                  ? {
                      path: entryFile.path,
                      language: entryFile.language,
                      content: entryFile.content,
                    }
                  : null
              }
              theme="dark"
              readOnly
              onChange={() => undefined}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
