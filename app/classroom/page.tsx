/**
 * STUDENT CLASSROOM SHELL
 * Placeholder for the main AI-driven learning interface.
 * Uses 100vw/100vh for a focused, distraction-free "vibe".
 */
export default function ClassroomPage({
  searchParams,
}: {
  searchParams: { topic?: string; mode?: string };
}) {
  const topic = searchParams.topic || "General Study";
  const mode = searchParams.mode || "Standard";

  return (
    <main className="h-screen w-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden">
      {/* Top Header - Simple & Clean */}
      <nav className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h1 className="font-semibold tracking-tight text-lg">Yantra Classroom</h1>
        <div className="flex gap-4 text-xs uppercase tracking-widest text-slate-400">
          <span>Topic: {topic}</span>
          <span>Mode: {mode}</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="aspect-video bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center">
            <p className="text-slate-500 font-medium">AI Stream Content Placeholder</p>
          </div>
          <p className="text-sm text-slate-400">
            Interactive elements and AI responses will be injected here.
          </p>
        </div>
      </section>
    </main>
  );
}
