import Link from 'next/link';
import { motion } from 'motion/react';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';
import { marketingNavLinks } from '@/src/features/marketing/marketing-content';
import { useScrollThreshold } from '@/src/features/motion/useScrollThreshold';

export function Navbar() {
  const scrolled = useScrollThreshold(50);

  return (
    <motion.nav
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? 'border-b border-white/10 bg-black/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-3xl tracking-widest hoverable">
          YANTRA<span className="text-white/50">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {marketingNavLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                data-no-route-loader="true"
                className={`hoverable text-xs font-bold uppercase tracking-widest transition-colors ${
                  link.label === 'Contributors' ? 'text-white' : 'text-muted hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={`hoverable text-xs font-bold uppercase tracking-widest transition-colors ${
                  link.label === 'Contributors' ? 'text-white' : 'text-muted hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ),
          )}

          <Link
            href="/editor"
            className="hoverable text-xs font-bold uppercase tracking-widest text-muted transition-colors hover:text-white"
          >
            Editor
          </Link>

          <Link
            href="/signup"
            className="hoverable rounded-full bg-white px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-transform duration-300 hover:scale-[0.98]"
          >
            Onboard
          </Link>
        </div>

        <GlobalSidebar disableDesktop={true} />
      </div>
    </motion.nav>
  );
}
