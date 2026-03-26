import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import 'lenis/dist/lenis.css';
import '../src/styles/globals.css';
import { ExperienceProvider } from '@/src/features/motion/ExperienceProvider';

export const metadata: Metadata = {
  title: 'Yantra',
  description:
    'Yantra is an AI-native learning platform for personalized roadmaps, certification signals, and job-ready outcomes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased selection:bg-white selection:text-black">
        <ExperienceProvider>{children}</ExperienceProvider>
      </body>
    </html>
  );
}
