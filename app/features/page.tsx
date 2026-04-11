import type { Metadata } from 'next';
import EditorFeaturesPage from '@/src/features/editor-site/EditorFeaturesPage';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Explore Monaco editing, instant runs, AI assist, smart files, sharing, and autosave in Yantra Code Editor.',
};

export default function FeaturesPage() {
  return <EditorFeaturesPage />;
}
