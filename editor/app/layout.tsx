import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yantra Code Editor',
  description: 'Code. Run. Share. Instantly. Yantra is a blazing-fast in-browser code editor with live preview, AI assist, and remixable share links.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
