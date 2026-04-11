import InfoPageShell from '@/src/features/legal/InfoPageShell';

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Terms"
      title="Terms for the current public Yantra experience."
      description="These terms summarize how the current Yantra build should be used while the platform continues moving from polished prototype to broader production rollout."
      statusLabel="Preview"
      sections={[
        {
          title: 'Product scope',
          body: [
            'The current Yantra release includes a public landing page, docs, a learner dashboard, a student profile view, a local editor, and an AI chat surface.',
            'Some product areas still represent guided launch flows or illustrative product surfaces rather than the final full learning platform.',
          ],
        },
        {
          title: 'User responsibilities',
          body: [
            'Use accurate learner details when you update the student profile, and avoid entering sensitive personal information you do not want stored on the current device.',
            'Do not misuse the AI chat, shared project flow, or access forms, and do not submit harmful, abusive, or unlawful content through the product.',
          ],
        },
        {
          title: 'Availability',
          body: [
            'Yantra may change features, copy, or flows as the launch expands and the product team responds to real usage.',
            'Temporary downtime may occur during deployment, environment changes, service-provider interruptions, or browser-storage resets on local-mode features.',
          ],
        },
        {
          title: 'Support',
          body: [
            'If a launch-critical issue affects the dashboard, local profile, editor flow, or AI chat, use the docs support path or your team support channel for follow-up.',
          ],
        },
      ]}
    />
  );
}
