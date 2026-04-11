import Link from 'next/link';

export default async function SharedProjectPlaceholder({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-[24px]">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
          Shared Preview
        </div>
        <h1 className="mt-5 font-display text-4xl leading-[0.96] tracking-tight text-white">
          Share links are disabled in local bypass mode
        </h1>
        <p className="mt-4 text-base leading-7 text-white/65">
          Requested share slug: <span className="font-mono text-white/85">{shareSlug}</span>.
          The share flow depends on the missing backend portion of the original app, so this local shell only supports direct editor previews.
        </p>
        <div className="mt-8">
          <Link
            href="/editor"
            className="inline-flex items-center rounded-full bg-white px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-black"
          >
            Back To Editor
          </Link>
        </div>
      </div>
    </main>
  );
}
