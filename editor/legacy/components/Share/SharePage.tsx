'use client';

import { ArrowLeft, ExternalLink, Link2, LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchSharedSnippet, stashPendingSharedSnippet } from '@/api/share';
import { MonacoEditor } from '@/components/Editor/MonacoEditor';
import { useEditorStore } from '@/store/useEditorStore';
import { LANGUAGE_META, type EditorFile, type SharedSnippet } from '@/types';

interface SharePageProps {
  shareId: string;
}

const buildFile = (snippet: SharedSnippet): EditorFile => ({
  id: `shared-preview-${snippet.shareId}`,
  name: `shared.${LANGUAGE_META[snippet.language].extension}`,
  language: snippet.language,
  content: snippet.code,
});

export default function SharePage({ shareId }: SharePageProps) {
  const theme = useEditorStore((state) => state.theme);
  const [snippet, setSnippet] = useState<SharedSnippet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.editorTheme = theme;
    return () => {
      delete document.documentElement.dataset.editorTheme;
    };
  }, [theme]);

  useEffect(() => {
    let isCancelled = false;

    const loadSnippet = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextSnippet = await fetchSharedSnippet(shareId);

        if (!isCancelled) {
          setSnippet(nextSnippet);
        }
      } catch (loadingError) {
        if (!isCancelled) {
          setError(
            loadingError instanceof Error
              ? loadingError.message
              : 'This shared snippet is unavailable right now.',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSnippet();

    return () => {
      isCancelled = true;
    };
  }, [shareId]);

  const file = useMemo(() => (snippet ? buildFile(snippet) : null), [snippet]);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-16%] h-72 w-72 rounded-full bg-violet-500/18 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-6%] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col gap-4">
        <header
          className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border px-5 py-4"
          style={{
            background: 'var(--yantra-shell)',
            borderColor: 'var(--yantra-border)',
            boxShadow: '0 22px 70px var(--yantra-shadow)',
          }}
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
              <Link2 className="h-3.5 w-3.5" />
              Shared snippet
            </div>
            <h1 className={`mt-3 text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Shared snippet · {snippet ? LANGUAGE_META[snippet.language].label : 'Loading...'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  : 'border-slate-900/10 bg-white text-slate-900 hover:bg-slate-50'
              }`}
              onClick={() => window.location.assign('/editor')}
              aria-label="Go to editor"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(124,58,237,0.28)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-violet-400/60"
              onClick={() => {
                if (!snippet) {
                  return;
                }

                stashPendingSharedSnippet(snippet);
                window.location.assign('/editor');
              }}
              disabled={!snippet}
              aria-label="Open shared snippet in editor"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Editor
            </button>
          </div>
        </header>

        <section
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border"
          style={{
            background: 'var(--yantra-panel)',
            borderColor: 'var(--yantra-border)',
            boxShadow: '0 24px 80px var(--yantra-shadow)',
          }}
        >
          {isLoading ? (
            <div className="flex min-h-[480px] flex-1 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading shared snippet...
            </div>
          ) : error ? (
            <div className="flex min-h-[480px] flex-1 items-center justify-center px-6">
              <div className="max-w-lg rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-700 dark:text-rose-200">
                {error}
              </div>
            </div>
          ) : (
            <div className="min-h-[480px] flex-1">
              <MonacoEditor
                file={file}
                onChange={() => undefined}
                theme={theme}
                readOnly
                showAIEnhancements={false}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
