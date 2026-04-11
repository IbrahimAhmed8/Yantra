import InfoPageShell from '@/src/features/legal/InfoPageShell';

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy"
      title="Privacy for the current public Yantra experience."
      description="Yantra currently runs in a public, local-first mode. The dashboard and editor can be used without creating an account, and most learner-facing state stays on the device you are using."
      statusLabel="Active"
      sections={[
        {
          title: 'What stays local',
          body: [
            'If you edit your student profile, those updates are saved in this browser so the dashboard and profile view stay in sync on this device.',
            'Projects created in the public editor or from shared remixes are also stored locally unless a future sync feature is added.',
          ],
        },
        {
          title: 'How data is used',
          body: [
            'Yantra uses local profile and progress data to shape labels and starter context inside the dashboard on the current device.',
            'Access request submissions are used only to review launch interest and follow up with prospective learners, institutions, or partners.',
          ],
        },
        {
          title: 'Server-side services',
          body: [
            'Yantra AI requests run through configured server-side AI services when the required keys are present in the deployment environment.',
            'Public access-request handling and supported backend diagnostics are processed through the deployed application infrastructure.',
          ],
        },
        {
          title: 'Questions',
          body: [
            'If you are using a shared machine, clear browser data when you finish so local profile and editor state do not remain available to the next person.',
            'If you need a manual privacy review, use the access form or your internal support channel to request one.',
          ],
        },
      ]}
    />
  );
}
