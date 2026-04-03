import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Bebas_Neue, Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import '../src/styles/globals.css';
import { ExperienceProvider } from '@/src/features/motion/ExperienceProvider';
import { Analytics } from '@vercel/analytics/react';

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const headingFont = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
  display: 'swap',
});

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

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
    <html
      lang="en"
      className={`${displayFont.variable} ${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="bg-black text-white antialiased selection:bg-white selection:text-black">
        <ExperienceProvider>
          {children}
          <Analytics />
        </ExperienceProvider>
      </body>
    </html>
  );
}