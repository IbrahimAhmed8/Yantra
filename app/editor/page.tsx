export default function EditorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-24 text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">Yantra</p>
        <h1 className="mt-6 font-heading text-5xl tracking-wide md:text-7xl">Code Editor</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
          The dedicated editor route is now live. We can wire the full Monaco workspace into this path next without
          changing the landing page link again.
        </p>
      </div>
    </main>
  );
}
