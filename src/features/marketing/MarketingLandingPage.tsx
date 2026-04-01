'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, animate, useInView } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { ChatProvider, useChatWidgetActions } from '@/src/features/chat/ChatWidget';
import { useOverlayLock } from '@/src/features/motion/ExperienceProvider';
import { useScrollThreshold } from '@/src/features/motion/useScrollThreshold';
import { yantraCtaPrompts } from '@/src/features/chat/yantra-chat';
import {
  marketingAcademicCards,
  marketingAccessDetails,
  marketingCampusHighlights,
  marketingNavLinks,
  marketingTickerItems,
} from './marketing-content';

const AccessRequestForm = dynamic(
  () => import('@/src/features/access/AccessRequestForm').then((module) => module.AccessRequestForm),
  {
    loading: () => (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-6 space-y-4">
          <div className="h-12 animate-pulse rounded bg-white/8" />
          <div className="h-12 animate-pulse rounded bg-white/8" />
          <div className="h-28 animate-pulse rounded bg-white/8" />
          <div className="h-12 w-40 animate-pulse rounded-full bg-white/12" />
        </div>
      </div>
    ),
  },
);

function FluidBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#040404]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.06),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%,transparent_78%,rgba(255,255,255,0.04))]" />

      <div className="absolute inset-0 opacity-85">
        <div className="absolute left-[-8%] top-[-6%] h-[34rem] w-[34rem] rounded-full bg-white/[0.07] blur-[120px] animate-blob" />
        <div className="absolute right-[-12%] top-[18%] h-[38rem] w-[38rem] rounded-full bg-white/[0.055] blur-[150px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-24%] left-[16%] h-[40rem] w-[42rem] rounded-full bg-white/[0.05] blur-[155px] animate-blob animation-delay-4000" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          maskImage: 'radial-gradient(circle at center, black 42%, transparent 86%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.92%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23noise)%22 opacity=%220.95%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}

function Nav() {
  const scrolled = useScrollThreshold(50);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useOverlayLock('marketing-mobile-nav', mobileMenuOpen);

  return (
    <>
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
            {marketingNavLinks.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  data-no-route-loader="true"
                  className="hoverable text-xs font-bold uppercase tracking-widest text-muted transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hoverable text-xs font-bold uppercase tracking-widest text-muted transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              )
            ))}

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

          <button
            type="button"
            className="text-white hoverable md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {mobileMenuOpen && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-black/95 p-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-end">
            <button
              type="button"
              className="p-2 text-white hoverable"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10">
            {marketingNavLinks.map((link, index) => (
              link.href.startsWith('#') ? (
                <motion.a
                  key={link.label}
                  href={link.href}
                  data-no-route-loader="true"
                  className="hoverable font-heading text-6xl uppercase tracking-widest"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ) : (
                <motion.div
                  key={link.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="hoverable font-heading text-6xl uppercase tracking-widest"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              )
            ))}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: marketingNavLinks.length * 0.1 }}
            >
              <Link
                href="/editor"
                className="hoverable font-heading text-6xl uppercase tracking-widest"
                onClick={() => setMobileMenuOpen(false)}
              >
                Editor
              </Link>
            </motion.div>

            <motion.div
              className="mt-8 flex w-full max-w-sm flex-col gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: (marketingNavLinks.length + 1) * 0.1 }}
            >
              <Link
                href="/signup"
                className="hoverable rounded-full bg-white px-8 py-4 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                Onboard
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}

function Hero() {
  const title = 'YANTRA';

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-28 sm:min-h-screen sm:pb-32 sm:pt-32">
      <div className="z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.div
          className="mb-12 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted backdrop-blur-md md:mb-16 md:text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          AI-native learning OS - Personalized paths
        </motion.div>

        <h1 className="flex flex-wrap justify-center text-[5.5rem] leading-none font-heading tracking-normal sm:text-8xl md:text-[12rem]">
          {title.split('').map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mt-12 max-w-3xl text-lg font-light tracking-wide text-muted md:mt-16 md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Yantra helps learners understand where they are, what to learn next, and how to turn that progress into
          real-world career outcomes.
        </motion.p>

        <motion.div
          className="mt-16 flex w-full flex-col items-center gap-4 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/signup"
            className="hoverable w-full rounded-full bg-white px-10 py-5 text-center text-sm font-bold uppercase tracking-widest text-black transition-transform duration-300 hover:scale-105 sm:w-auto"
          >
            Start Onboarding
          </Link>
          <Link
            href="/editor"
            className="hoverable inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#7C3AED] bg-transparent px-6 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-[#7C3AED] transition-colors duration-200 ease-in-out hover:bg-[#7C3AED] hover:text-white sm:w-auto"
          >
            Open Code Editor <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.p
          className="mt-6 text-center text-sm text-white/42"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.96, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Institutions and hiring partners can still use the access form below.
        </motion.p>

        <motion.div
          className="absolute bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] flex flex-col items-center gap-4 sm:bottom-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <div className="h-12 w-[1px] bg-gradient-to-b from-white/50 to-transparent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}

function Ticker() {
  return (
    <div className="relative z-10 flex w-full overflow-hidden whitespace-nowrap border-y border-white/10 bg-white/5 py-4 backdrop-blur-sm">
      <motion.div
        className="flex items-center gap-8 font-mono text-xs tracking-widest text-white/50 md:text-sm"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 30 }}
      >
        {[...Array(2)].map((_, index) => (
          <div key={index} className="flex items-center gap-8">
            {marketingTickerItems.map((item) => (
              <div key={`${index}-${item}`} className="flex items-center gap-8">
                <span>{item}</span>
                <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function About() {
  const quote = 'LEARN WITH DIRECTION. GROW WITH PROOF.';

  return (
    <section id="about" className="relative mx-auto max-w-7xl overflow-hidden px-6 py-32 scroll-mt-28">
      <div className="pointer-events-none absolute left-0 top-0 select-none font-heading text-[12rem] leading-none text-white/[0.03] md:text-[20rem]">
        01
      </div>
      <div className="relative z-10 mt-20 grid items-center gap-16 md:grid-cols-2">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-5xl font-heading leading-[0.9] text-white md:text-7xl">{quote}</h2>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-col gap-6 text-lg font-light leading-relaxed text-muted"
        >
          <p>
            Yantra is built as an AI-native learning platform that begins with skill diagnosis and turns that insight
            into a clear personalized roadmap.
          </p>
          <p>
            Instead of disconnected lessons and endless tutorials, it keeps guidance, certification, and job-readiness
            inside one continuous system for focused growth.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Counter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView || !ref.current) {
      return;
    }

    animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = `${Math.floor(latest)}${suffix}`;
        }
      },
    });
  }, [inView, suffix, value]);

  return (
    <div className="hoverable flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md transition-colors duration-500 hover:bg-white/[0.04]">
      <span ref={ref} className="mb-2 text-6xl font-heading tracking-tight text-white md:text-8xl">
        0{suffix}
      </span>
      <span className="font-mono text-xs uppercase tracking-widest text-muted">{label}</span>
    </div>
  );
}

function Stats() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <Counter value={10} label="Active Learners" suffix="K+" />
        <Counter value={50} label="Institution Pilots" suffix="+" />
        <Counter value={94} label="Success Rate" suffix="%" />
        <Counter value={24} label="AI Guidance" suffix="/7" />
      </div>
    </section>
  );
}

function Academics() {
  return (
    <section id="academics" className="relative mx-auto max-w-7xl px-6 py-32 scroll-mt-28">
      <div className="pointer-events-none absolute right-0 top-0 select-none text-right font-heading text-[12rem] leading-none text-white/[0.03] md:text-[20rem]">
        02
      </div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-20"
      >
        <h2 className="text-center text-5xl font-heading md:text-7xl">PLATFORM CAPABILITIES</h2>
      </motion.div>

      <div className="relative z-10 mt-16 grid gap-8 md:grid-cols-3">
        {marketingAcademicCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="hoverable group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]"
            >
              <div className="mb-6 text-white opacity-50 transition-opacity group-hover:opacity-100">
                <Icon size={32} />
              </div>
              <h3 className="mb-4 text-3xl font-heading tracking-wide">{card.title}</h3>
              <p className="font-light leading-relaxed text-muted">{card.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="campus-life" className="relative mx-auto max-w-7xl px-6 py-32 scroll-mt-28">
      <div className="pointer-events-none absolute left-0 top-0 select-none font-heading text-[7rem] leading-none text-white/[0.03] sm:text-[10rem] md:text-[14rem] xl:text-[18rem]">
        03
      </div>
      <motion.div
        className="relative z-10 mb-14 mt-16 max-w-4xl md:mb-16 md:mt-20"
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-4xl font-heading tracking-[0.06em] text-white sm:text-5xl md:text-7xl">
          WHO YANTRA SERVES
        </h2>
      </motion.div>

      <div className="relative z-10 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {marketingCampusHighlights.map((column, columnIndex) => (
          <div key={`audience-column-${columnIndex}`} className="flex h-full flex-col gap-4 self-stretch">
            {column.map((item, itemIndex) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.title}
                  initial={{ y: 24, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.65,
                    delay: columnIndex * 0.1 + itemIndex * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`hoverable group relative flex min-h-[16rem] flex-1 flex-col justify-between overflow-hidden rounded-[1.6rem] border border-white/8 bg-[linear-gradient(145deg,rgba(16,16,16,0.96),rgba(5,5,5,0.98))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.34)] transition-all duration-300 hover:-translate-y-1 hover:border-white/14 sm:p-8 ${item.heightClassName}`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015)_34%,transparent_62%)] opacity-80" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />

                  <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/88 transition-colors duration-300 group-hover:border-white/16 group-hover:bg-white/[0.05]">
                    <Icon size={20} strokeWidth={1.7} />
                  </div>

                  <div className="relative z-10 mt-10">
                    <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/34">{item.tag}</span>
                    <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[1.7rem]">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-[24rem] text-sm leading-7 text-white/46 sm:text-[0.95rem]">
                      {item.desc}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const { openChat } = useChatWidgetActions();

  return (
    <section id="contact" className="relative mx-auto max-w-7xl border-t border-white/10 px-6 py-32 scroll-mt-28">
      <div className="pointer-events-none absolute right-0 top-0 select-none text-right font-heading text-[12rem] leading-none text-white/[0.03] md:text-[20rem]">
        04
      </div>
      <div className="relative z-10 mt-20 grid gap-16 md:grid-cols-2">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="mb-8 text-5xl font-heading md:text-7xl">ACCESS & PARTNERSHIPS</h2>
          <div className="space-y-6 font-mono text-sm text-muted">
            <p className="flex items-start gap-4 break-words md:items-center">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              {marketingAccessDetails.primary}
            </p>
            <p className="flex items-start gap-4 break-words md:items-center">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
              {marketingAccessDetails.audience}
            </p>
            <p className="flex items-start gap-4 break-words md:items-center">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
              {marketingAccessDetails.status}
            </p>
          </div>

          <button
            type="button"
            className="hoverable mt-10 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/78 transition-colors hover:bg-white/[0.08]"
            onClick={() => openChat({ message: yantraCtaPrompts.requestAccess })}
          >
            Ask Yantra First <ArrowRight size={14} />
          </button>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-col gap-8"
        >
          <AccessRequestForm className="flex flex-col gap-8" />
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const { openChat } = useChatWidgetActions();

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-white/10 px-6 py-12">
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="font-heading text-3xl tracking-widest">
          YANTRA<span className="text-white/50">.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs uppercase tracking-widest text-muted">
          <a href="#about" data-no-route-loader="true" className="hoverable transition-colors hover:text-white">
            Platform
          </a>
          <button
            type="button"
            className="hoverable transition-colors hover:text-white"
            onClick={() => openChat({ message: yantraCtaPrompts.demo })}
          >
            Demo
          </button>
          <Link href="/signup" className="hoverable transition-colors hover:text-white">
            Create Account
          </Link>
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-white/50">
          &copy; {new Date().getFullYear()} Yantra. AI-native learning, built for outcomes.
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLandingPage() {
  return (
    <ChatProvider>
      <div className="min-h-[100svh] bg-transparent text-white selection:bg-white selection:text-black sm:min-h-screen">
        <FluidBackground />
        <Nav />
        <main>
          <Hero />
          <Ticker />
          <About />
          <Stats />
          <Academics />
          <Gallery />
          <Contact />
        </main>
        <Footer />
      </div>
    </ChatProvider>
  );
}
