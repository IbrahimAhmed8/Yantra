import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Bebas_Neue, Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import '../src/styles/globals.css';
import { ExperienceProvider } from '@/src/features/motion/ExperienceProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Yantra Code Editor',
    template: '%s | Yantra',
  },
  description:
    'Code. Run. Share. Instantly. Yantra is a blazing-fast in-browser code editor with Monaco editing, live previews, and remixable share links.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${bebasNeue.variable} ${jetbrainsMono.variable} bg-black text-white antialiased selection:bg-white selection:text-black`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:font-mono focus:text-[10px] focus:uppercase focus:tracking-[0.22em] focus:text-black focus:no-underline focus:shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        >
          Skip to main content
        </a>
        <ExperienceProvider>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Analytics />
        </ExperienceProvider>
      </body>
    </html>
  );
}
