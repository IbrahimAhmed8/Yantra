import type { Metadata } from 'next';
import EditorGuidePage from '@/src/features/editor-site/EditorGuidePage';

export const metadata: Metadata = {
  title: 'Guide',
  description: 'Get started with Yantra Code Editor in minutes with the fastest path from opening the editor to running and sharing code.',
};

export default function GuidePage() {
  return <EditorGuidePage />;
}
