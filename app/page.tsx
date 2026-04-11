import type { Metadata } from 'next';
import EditorMarketingHomePage from '@/src/features/editor-site/EditorMarketingHomePage';

export const metadata: Metadata = {
  title: 'Yantra Code Editor',
  description: 'Code. Run. Share. Instantly. Yantra is a blazing-fast in-browser code editor with live preview, AI assist, and remixable share links.',
};

export default function Page() {
  return <EditorMarketingHomePage />;
}
