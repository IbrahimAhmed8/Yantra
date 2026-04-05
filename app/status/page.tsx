import InfoPageShell from '@/src/features/legal/InfoPageShell';

export default function StatusPage() {
  return (
    <InfoPageShell
      eyebrow="System Status"
      title="Current system status for the launch build."
      description="This page gives users a real destination for status checks during launch, even before a full external status system is introduced."
      statusLabel="Operational"
      sections={[
        {
          title: 'Frontend',
          body: [
            'The public landing page, authentication pages, onboarding flow, dashboard, and student profile experience are expected to be available in the current launch build.',
          ],
        },
        {
          title: 'Authentication',
          body: [
            'Email/password sign-in, password recovery, and Google or GitHub sign-in rely on Supabase configuration in the deployment environment.',
            'If those credentials are missing or incomplete, the UI surfaces a clear message instead of silently failing.',
          ],
        },
        {
          title: 'AI chat',
          body: [
            'Yantra AI depends on a configured Gemini API key. If that key is unavailable, the chat surface will remain visible but return an explanatory error state.',
          ],
        },
        {
          title: 'Next step',
          body: [
            'If you are seeing an unexpected issue during launch, retry the action once and then route the report through your team support channel with the page and action that failed.',
          ],
        },
      ]}
    />
  );
}
