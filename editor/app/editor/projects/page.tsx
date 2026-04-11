import Link from 'next/link';

export default function EditorProjectsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-[24px]">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
          Local Dev Mode
        </div>
        <h1 className="mt-5 font-display text-4xl leading-[0.96] tracking-tight text-white">
          Projects live in your browser for this preview
        </h1>
        <p className="mt-4 text-base leading-7 text-white/65">
          The extracted workspace does not include the full authenticated project backend, so the editor runs in local bypass mode.
          Create and edit playgrounds from the main editor page and they will persist in this browser&apos;s local storage.
        </p>
        <div className="mt-8">
          <Link
            href="/editor"
            className="inline-flex items-center rounded-full bg-white px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-black"
          >
            Open Editor
          </Link>
        </div>
      </div>
    </main>
  );
}
