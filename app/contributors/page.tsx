import type { Metadata } from 'next';
import ContributorsExperience from '@/src/features/contributors/ContributorsExperience';

export const metadata: Metadata = {
  title: 'Yantra Contributors',
  description:
    'Meet the builders behind Yantra, see the active repo footprint, and explore how the team is shaping the platform.',
};

export default function ContributorsPage() {
  return <ContributorsExperience />;
}
