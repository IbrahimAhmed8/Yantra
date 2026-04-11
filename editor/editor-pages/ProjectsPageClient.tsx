'use client';

import { startTransition, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, Plus, Sparkles } from 'lucide-react';
import type { EditorProjectDetails, EditorProjectSummary, EditorTemplateKey } from '@/editor/types';
import {
  createLocalEditorProject,
  listLocalEditorProjects,
  saveLocalEditorProject,
} from '@/editor/lib/local-dev-projects';
import { PUBLIC_EDITOR_USER } from '@/src/lib/public-mode';

type ProjectsPageClientProps = {
  initialProjects: EditorProjectSummary[];
  devBypass?: boolean;
};

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}.`);
  }

  return payload;
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleString();
}

export default function ProjectsPageClient({ initialProjects, devBypass = false }: ProjectsPageClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState<EditorTemplateKey | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!devBypass) {
      setProjects(initialProjects);
      return;
    }

    setProjects(listLocalEditorProjects());
  }, [devBypass, initialProjects]);

  async function createProject(templateKey: EditorTemplateKey) {
    setCreatingTemplate(templateKey);
    setCreateError(null);

    try {
      if (devBypass) {
        const created = saveLocalEditorProject(createLocalEditorProject(templateKey, PUBLIC_EDITOR_USER.id));
        setProjects(listLocalEditorProjects());

        startTransition(() => {
          router.push(`/editor?projectId=${created.project.id}`);
        });
        return;
      }

      const created = await readJson<EditorProjectDetails>(
        await fetch('/api/editor/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ templateKey }),
        }),
      );

      startTransition(() => {
        router.push(`/editor?projectId=${created.project.id}`);
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create a new project.');
      setCreatingTemplate(null);
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
              {devBypass ? 'Local Editor Projects' : 'Editor Projects'}
            </div>
            <h1 className="mt-4 font-display text-[3rem] leading-[0.9] tracking-tight text-white">Your playgrounds</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/58">
              {devBypass
                ? 'Your projects now save locally on this device. Start a fresh Python, JavaScript, or web playground whenever you want.'
                : 'Jump back into a saved project or start a fresh Python, JavaScript, or web playground.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-black transition-transform hover:scale-[0.99]"
              onClick={() => setTemplatePickerOpen((current) => !current)}
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        </header>

        {templatePickerOpen ? (
          <section className="mt-5 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.28)] backdrop-blur-[24px]">
            <div className="grid gap-4 md:grid-cols-3">
              <button
                type="button"
                className="rounded-[1.6rem] border border-white/8 bg-black/28 p-5 text-left transition hover:border-white/16 hover:bg-white/[0.05]"
                onClick={() => {
                  void createProject('python-playground');
                }}
                disabled={creatingTemplate !== null}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">Template</div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">Python Playground</div>
                <p className="mt-2 text-sm leading-relaxed text-white/58">Single-file Python project using the in-browser Pyodide runtime.</p>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                  {creatingTemplate === 'python-playground' ? 'Creating...' : 'main.py ready'}
                </div>
              </button>

              <button
                type="button"
                className="rounded-[1.6rem] border border-white/8 bg-black/28 p-5 text-left transition hover:border-white/16 hover:bg-white/[0.05]"
                onClick={() => {
                  void createProject('js-playground');
                }}
                disabled={creatingTemplate !== null}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">Template</div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">JavaScript Playground</div>
                <p className="mt-2 text-sm leading-relaxed text-white/58">Single-file JavaScript starter with in-browser console capture on Run.</p>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                  {creatingTemplate === 'js-playground' ? 'Creating...' : 'script.js ready'}
                </div>
              </button>

              <button
                type="button"
                className="rounded-[1.6rem] border border-white/8 bg-black/28 p-5 text-left transition hover:border-white/16 hover:bg-white/[0.05]"
                onClick={() => {
                  void createProject('web-playground');
                }}
                disabled={creatingTemplate !== null}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">Template</div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">Web Playground</div>
                <p className="mt-2 text-sm leading-relaxed text-white/58">HTML, CSS, and JavaScript starter files with live iframe preview on Run.</p>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                  {creatingTemplate === 'web-playground' ? 'Creating...' : 'index.html + style.css + script.js'}
                </div>
              </button>
            </div>

            {createError ? (
              <div className="mt-4 rounded-[1.4rem] border border-rose-300/18 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {createError}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="mt-5">
          {projects.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.02] p-8 text-center text-white/62">
              <div className="font-display text-3xl tracking-tight text-white">No saved projects yet</div>
              <p className="mt-3 text-sm leading-relaxed">
                Open the template selector above to create your first Yantra playground.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/editor?projectId=${project.id}`}
                  className="group rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.28)] backdrop-blur-[24px] transition hover:border-white/16 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">{project.primaryLanguage}</div>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white group-hover:text-white">
                        {project.title}
                      </h2>
                    </div>
                    {creatingTemplate === project.templateKey ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  </div>

                  <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-black/28 p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">Last updated</div>
                    <div className="mt-2 text-sm leading-relaxed text-white/72">{formatUpdatedAt(project.updatedAt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
