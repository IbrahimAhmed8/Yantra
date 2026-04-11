import InfoPageShell from '@/src/features/legal/InfoPageShell';

export default function StatusPage() {
  return (
    <InfoPageShell
      eyebrow="System Status"
      title="Current system status for the public build."
      description="This page gives users a real destination for status checks, even before a full external status system is introduced."
      statusLabel="Operational"
      sections={[
        {
          title: 'Frontend',
          body: [
            'The public landing page, docs, dashboard, student profile experience, and editor are expected to be available in the current build.',
          ],
        },
        {
          title: 'Local data and sign-in',
          body: [
            'Student profile data and local editor projects are stored in the current browser for the public experience.',
            'If browser storage is cleared or blocked, those local surfaces may reset and need to be recreated on that device.',
            'Email/password sign-in, password recovery, and Google or GitHub sign-in rely on Supabase configuration in the deployment environment.',
            'If those credentials are missing or incomplete, the UI surfaces a clear message instead of silently failing.',
          ],
        },
        {
          title: 'AI chat',
          body: [
            'Yantra AI depends on a configured Gemini API key or the connected AI service URL. If those are unavailable, the chat surface remains visible but returns an explanatory error state.',
          ],
        },
        {
          title: 'Next step',
          body: [
            'If you are seeing an unexpected issue, retry the action once and then route the report through docs support or your team support channel with the page and action that failed.',
          ],
        },
      ]}
    />
  );
}
