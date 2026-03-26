'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, animate, useInView } from 'motion/react';
import { ArrowRight, BookOpen, Globe, Menu, Palette, X } from 'lucide-react';
import { ChatProvider, useChatWidget } from '@/src/features/chat/ChatWidget';
import { useOverlayLock } from '@/src/features/motion/ExperienceProvider';
import { yantraCtaPrompts } from '@/src/features/chat/yantra-chat';

const accessDetails = {
  primary: 'AI-native learning operating system',
  audience: 'Built for learners, institutions, and hiring partners',
  status: 'Learner accounts are previewing now, and pilot conversations remain open for partners.',
};

const tickerItems = [
  'AI SKILL DIAGNOSIS',
  'PERSONALIZED ROADMAPS',
  'CERTIFICATIONS',
  'JOB MATCHING',
];

const academicCards = [
  {
    icon: <BookOpen size={32} />,
    title: 'AI TUTORING',
    desc: 'Yantra adapts to each learner in real time with guided lessons, feedback loops, and contextual support that keeps momentum high.',
  },
  {
    icon: <Globe size={32} />,
    title: 'ADAPTIVE ROADMAPS',
    desc: 'The platform analyzes skill level, goal, and pace to generate a focused path instead of sending users through generic course clutter.',
  },
  {
    icon: <Palette size={32} />,
    title: 'PROOF & PLACEMENT',
    desc: 'Projects, certifications, and employer-aligned signals stay connected so learning translates into visible progress and job readiness.',
  },
];

const campusHighlights = [
  { title: 'Students', gradient: 'from-white/[0.16] via-white/[0.05] to-transparent', height: 'h-64' },
  { title: 'Career Switchers', gradient: 'from-white/[0.14] via-white/[0.04] to-transparent', height: 'h-96' },
  { title: 'Institutions', gradient: 'from-white/[0.12] via-white/[0.03] to-transparent', height: 'h-80' },
  { title: 'Hiring Partners', gradient: 'from-white/[0.18] via-white/[0.05] to-transparent', height: 'h-96' },
  { title: 'Certification Paths', gradient: 'from-white/[0.14] via-white/[0.04] to-transparent', height: 'h-72' },
  { title: 'Job Matching', gradient: 'from-white/[0.1] via-white/[0.03] to-transparent', height: 'h-64' },
];

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useOverlayLock('marketing-mobile-nav', mobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Platform', href: '#about' },
    { label: 'Capabilities', href: '#academics' },
    { label: 'Use Cases', href: '#campus-life' },
    { label: 'Access', href: '#contact' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled ? 'border-b border-white/10 bg-black/80 backdrop-blur-xl' : 'bg-transparent py-2'
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
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hoverable text-xs font-bold uppercase tracking-widest text-muted transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}

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
            {links.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="hoverable font-heading text-6xl uppercase tracking-widest"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </motion.a>
            ))}

            <motion.div
              className="mt-8 flex w-full max-w-sm flex-col gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: links.length * 0.1 }}
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
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-32 pt-32">
      <div className="z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.div
          className="mb-12 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted backdrop-blur-md md:mb-16 md:text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          AI-native learning OS • Personalized paths
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
          className="absolute bottom-8 flex flex-col items-center gap-4"
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
            {tickerItems.map((item) => (
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
        {academicCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hoverable group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]"
          >
            <div className="mb-6 text-white opacity-50 transition-opacity group-hover:opacity-100">{card.icon}</div>
            <h3 className="mb-4 text-3xl font-heading tracking-wide">{card.title}</h3>
            <p className="font-light leading-relaxed text-muted">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="campus-life" className="relative mx-auto max-w-7xl px-6 py-32 scroll-mt-28">
      <div className="pointer-events-none absolute left-0 top-0 select-none font-heading text-[12rem] leading-none text-white/[0.03] md:text-[20rem]">
        03
      </div>
      <motion.h2
        className="relative z-10 mt-20 mb-16 text-5xl font-heading md:text-7xl"
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        WHO YANTRA SERVES
      </motion.h2>

      <div className="masonry-grid relative z-10">
        {campusHighlights.map((item, index) => (
          <motion.div
            key={item.title}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: { y: 50, opacity: 0, scale: 1 },
              visible: {
                y: 0,
                opacity: 1,
                scale: 1,
                transition: { duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] },
              },
              hover: {
                scale: 1.03,
                y: 0,
                opacity: 1,
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className={`masonry-item hoverable relative overflow-hidden rounded-3xl border border-white/10 bg-black ${item.height}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
            <div className="absolute inset-0 bg-white/[0.03] mix-blend-overlay" />

            <motion.div
              variants={{
                hidden: { y: '100%' },
                visible: { y: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
                hover: { y: '0%', transition: { type: 'spring', stiffness: 350, damping: 25 } },
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">{item.title}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const { openChat } = useChatWidget();
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const accessMessage = [
    yantraCtaPrompts.requestAccess,
    form.name ? `Name: ${form.name}` : null,
    form.email ? `Email: ${form.email}` : null,
    form.message ? `Details: ${form.message}` : null,
  ]
    .filter(Boolean)
    .join('\n');

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
              {accessDetails.primary}
            </p>
            <p className="flex items-start gap-4 break-words md:items-center">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
              {accessDetails.audience}
            </p>
            <p className="flex items-start gap-4 break-words md:items-center">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
              {accessDetails.status}
            </p>
          </div>
        </motion.div>

        <motion.form
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-col gap-8"
          onSubmit={(event) => {
            event.preventDefault();
            openChat({ message: accessMessage });
          }}
        >
          <div className="relative">
            <input
              type="text"
              id="name"
              placeholder=" "
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="input-field hoverable peer w-full border-b border-border bg-transparent py-3 text-white transition-colors focus:border-accent focus:outline-none"
            />
            <label
              htmlFor="name"
              className="input-label pointer-events-none absolute left-0 top-3 font-mono text-sm text-muted transition-all duration-300"
            >
              Full Name
            </label>
          </div>
          <div className="relative">
            <input
              type="email"
              id="email"
              placeholder=" "
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="input-field hoverable peer w-full border-b border-border bg-transparent py-3 text-white transition-colors focus:border-accent focus:outline-none"
            />
            <label
              htmlFor="email"
              className="input-label pointer-events-none absolute left-0 top-3 font-mono text-sm text-muted transition-all duration-300"
            >
              Work or Personal Email
            </label>
          </div>
          <div className="relative">
            <textarea
              id="message"
              rows={4}
              placeholder=" "
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className="input-field hoverable peer w-full resize-none border-b border-border bg-transparent py-3 text-white transition-colors focus:border-accent focus:outline-none"
            />
            <label
              htmlFor="message"
              className="input-label pointer-events-none absolute left-0 top-3 font-mono text-sm text-muted transition-all duration-300"
            >
              Tell us if you are a learner, institution, or hiring partner
            </label>
          </div>

          <button className="hoverable mt-4 flex items-center gap-2 self-start rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition-transform duration-300 hover:scale-105">
            Request Access <ArrowRight size={16} />
          </button>
        </motion.form>
      </div>
    </section>
  );
}

function Footer() {
  const { openChat } = useChatWidget();

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-white/10 px-6 py-12">
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="font-heading text-3xl tracking-widest">
          YANTRA<span className="text-white/50">.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs uppercase tracking-widest text-muted">
          <a href="#about" className="hoverable transition-colors hover:text-white">
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
      <div className="min-h-screen bg-transparent text-white selection:bg-white selection:text-black">
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
