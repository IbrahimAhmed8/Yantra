'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate, useMotionValue, useSpring } from 'motion/react';
import { Menu, X, BookOpen, Globe, Palette, ArrowRight } from 'lucide-react';
import { ChatProvider, useChatWidget } from '@/src/features/chat/ChatWidget';
import { yantraCtaPrompts } from '@/src/features/chat/yantra-chat';

const productLinks = {
  home: '#about',
};

const accessDetails = {
  primary: 'AI-native learning operating system',
  audience: 'Built for learners, institutions, and hiring partners',
  status: 'Early access, product walkthroughs, and pilot conversations open now',
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
  { title: 'Students', gradient: 'from-blue-900/40 to-slate-900', height: 'h-64' },
  { title: 'Career Switchers', gradient: 'from-emerald-900/40 to-slate-900', height: 'h-96' },
  { title: 'Institutions', gradient: 'from-amber-900/40 to-slate-900', height: 'h-80' },
  { title: 'Hiring Partners', gradient: 'from-purple-900/40 to-slate-900', height: 'h-96' },
  { title: 'Certification Paths', gradient: 'from-rose-900/40 to-slate-900', height: 'h-72' },
  { title: 'Job Matching', gradient: 'from-cyan-900/40 to-slate-900', height: 'h-64' },
];

function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX - 6);
      cursorY.set(e.clientY - 6);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovered(Boolean(target.closest('a, button, input, textarea, .hoverable')));
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-3 h-3 bg-text rounded-full pointer-events-none z-[100] mix-blend-difference hidden md:block"
      style={{ x: cursorXSpring, y: cursorYSpring }}
      animate={{ scale: isHovered ? 3 : 1 }}
      transition={{ scale: { type: 'spring', stiffness: 300, damping: 20 } }}
    />
  );
}

function FluidBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-black pointer-events-none">
      <svg className="hidden">
        <filter id="smoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" result="noise">
            <animate attributeName="baseFrequency" values="0.011;0.015;0.011" dur="20s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="absolute inset-0 opacity-40" style={{ filter: 'url(#smoke) blur(30px)' }}>
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-white/20 animate-blob mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gray-400/20 animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-zinc-500/20 animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      <div
        className="absolute inset-0 z-10 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
    </div>
  );
}

function Nav() {
  const { openChat } = useChatWidget();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'py-4 bg-black/80 backdrop-blur-xl border-b border-white/10' : 'py-8 bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className="font-heading text-3xl tracking-widest hoverable">
            YANTRA<span className="text-white/50">.</span>
          </a>

          <div className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <a key={link.label} href={link.href} className="text-xs font-bold tracking-widest uppercase text-muted hover:text-text transition-colors relative group hoverable">
                {link.label}
              </a>
            ))}
            <button
              type="button"
              className="ml-4 px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-bold tracking-widest uppercase hover:bg-white/10 transition-colors hoverable"
              onClick={() => openChat({ message: yantraCtaPrompts.waitlist })}
            >
              Join Waitlist
            </button>
          </div>

          <button className="md:hidden text-text hoverable" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {mobileMenuOpen && (
        <motion.div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex flex-col p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-end">
            <button className="text-white hoverable p-2" onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col gap-6 mt-12 items-center justify-center flex-1">
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="text-6xl font-heading hoverable tracking-widest uppercase"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.button
              type="button"
              className="mt-8 px-8 py-4 rounded-full border border-white/20 bg-white/5 text-sm font-bold tracking-widest uppercase hover:bg-white/10 transition-colors hoverable"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: links.length * 0.1 }}
              onClick={() => {
                setMobileMenuOpen(false);
                openChat({ message: yantraCtaPrompts.waitlist });
              }}
            >
              Join Waitlist
            </motion.button>
          </div>
        </motion.div>
      )}
    </>
  );
}

function Hero() {
  const { openChat } = useChatWidget();
  const title = 'YANTRA';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-32">
      <div className="z-10 text-center flex flex-col items-center max-w-5xl mx-auto w-full">
        <motion.div
          className="mb-12 md:mb-16 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md font-mono text-xs md:text-sm tracking-[0.2em] text-muted uppercase text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          AI-native learning OS • Personalized paths
        </motion.div>

        <h1 className="text-[5.5rem] sm:text-8xl md:text-[12rem] leading-none font-heading tracking-normal flex flex-wrap justify-center">
          {title.split('').map((char, index) => (
            <motion.span
              key={index}
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
          className="mt-12 md:mt-16 text-lg md:text-2xl text-muted font-light tracking-wide max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Yantra helps learners understand where they are, what to learn next, and how to turn that progress into real-world career outcomes.
        </motion.p>

        <motion.div
          className="mt-16 md:mt-20 flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hoverable hover:scale-105 transition-transform duration-300 text-center"
            onClick={() => openChat({ message: yantraCtaPrompts.requestAccess })}
          >
            Request Access &rarr;
          </button>
          <a href="#about" className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/20 backdrop-blur-md rounded-full font-bold text-sm tracking-widest uppercase hoverable hover:bg-white/10 transition-colors duration-300 text-center">
            Explore Yantra
          </a>
        </motion.div>

        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted uppercase">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}

function Ticker() {
  return (
    <div className="w-full overflow-hidden bg-white/5 border-y border-white/10 py-4 flex whitespace-nowrap backdrop-blur-sm relative z-10">
      <motion.div
        className="flex gap-8 items-center font-mono text-xs md:text-sm text-white/50 tracking-widest"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 30 }}
      >
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center">
            {tickerItems.map((item) => (
              <div key={`${i}-${item}`} className="flex gap-8 items-center">
                <span>{item}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
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
    <section id="about" className="py-32 px-6 max-w-7xl mx-auto overflow-hidden relative">
      <div className="text-[12rem] md:text-[20rem] font-heading text-white/[0.03] absolute top-0 left-0 pointer-events-none leading-none select-none">
        01
      </div>
      <div className="grid md:grid-cols-2 gap-16 items-center relative z-10 mt-20">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-5xl md:text-7xl font-heading leading-[0.9] text-text">{quote}</h2>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex flex-col gap-6 text-muted font-light leading-relaxed text-lg"
        >
          <p>
            Yantra is built as an AI-native learning platform that begins with skill diagnosis and turns that insight into a clear personalized roadmap.
          </p>
          <p>
            Instead of disconnected lessons and endless tutorials, it keeps guidance, certification, and job-readiness inside one continuous system for focused growth.
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
    if (inView && ref.current) {
      animate(0, value, {
        duration: 2,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          if (ref.current) ref.current.textContent = `${Math.floor(latest)}${suffix}`;
        },
      });
    }
  }, [inView, value, suffix]);

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] transition-colors duration-500 hoverable">
      <span ref={ref} className="text-6xl md:text-8xl font-heading text-white mb-2 tracking-tight">
        0{suffix}
      </span>
      <span className="text-xs font-mono text-muted uppercase tracking-widest">{label}</span>
    </div>
  );
}

function Stats() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
    <section id="academics" className="py-32 px-6 max-w-7xl mx-auto relative">
      <div className="text-[12rem] md:text-[20rem] font-heading text-white/[0.03] absolute top-0 right-0 pointer-events-none leading-none select-none text-right">
        02
      </div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-20"
      >
        <h2 className="text-5xl md:text-7xl font-heading mb-16 text-center">PLATFORM CAPABILITIES</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 relative z-10">
        {academicCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-white/[0.02] backdrop-blur-md p-8 rounded-3xl border border-white/10 hoverable overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]"
          >
            <div className="text-white mb-6 opacity-50 group-hover:opacity-100 transition-opacity">{card.icon}</div>
            <h3 className="text-3xl font-heading mb-4 tracking-wide">{card.title}</h3>
            <p className="text-muted font-light leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section id="campus-life" className="py-32 px-6 max-w-7xl mx-auto relative">
      <div className="text-[12rem] md:text-[20rem] font-heading text-white/[0.03] absolute top-0 left-0 pointer-events-none leading-none select-none">
        03
      </div>
      <motion.h2
        className="text-5xl md:text-7xl font-heading mb-16 relative z-10 mt-20"
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        WHO YANTRA SERVES
      </motion.h2>

      <div className="masonry-grid relative z-10">
        {campusHighlights.map((img, i) => (
          <motion.div
            key={i}
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
                transition: { duration: 0.6, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] },
              },
              hover: {
                scale: 1.03,
                y: 0,
                opacity: 1,
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className={`masonry-item relative rounded-3xl overflow-hidden bg-gradient-to-br ${img.gradient} ${img.height} hoverable cursor-pointer border border-white/10`}
          >
            <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />

            <motion.div
              variants={{
                hidden: { y: '100%' },
                visible: { y: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
                hover: { y: '0%', transition: { type: 'spring', stiffness: 350, damping: 25 } },
              }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm"
            >
              <span className="font-mono text-white tracking-widest uppercase text-xs font-bold">{img.title}</span>
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
    <section id="contact" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/10 relative">
      <div className="text-[12rem] md:text-[20rem] font-heading text-white/[0.03] absolute top-0 right-0 pointer-events-none leading-none select-none text-right">
        04
      </div>
      <div className="grid md:grid-cols-2 gap-16 relative z-10 mt-20">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-5xl md:text-7xl font-heading mb-8">ACCESS & PARTNERSHIPS</h2>
          <div className="space-y-6 font-mono text-sm text-muted">
            <p className="flex items-start md:items-center gap-4 break-words">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {accessDetails.primary}
            </p>
            <p className="flex items-start md:items-center gap-4 break-words">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
              {accessDetails.audience}
            </p>
            <p className="flex items-start md:items-center gap-4 break-words">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
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
              className="input-field w-full bg-transparent border-b border-border py-3 text-text focus:outline-none focus:border-accent transition-colors peer hoverable"
            />
            <label htmlFor="name" className="input-label absolute left-0 top-3 text-muted font-mono text-sm transition-all duration-300 pointer-events-none">
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
              className="input-field w-full bg-transparent border-b border-border py-3 text-text focus:outline-none focus:border-accent transition-colors peer hoverable"
            />
            <label htmlFor="email" className="input-label absolute left-0 top-3 text-muted font-mono text-sm transition-all duration-300 pointer-events-none">
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
              className="input-field w-full bg-transparent border-b border-border py-3 text-text focus:outline-none focus:border-accent transition-colors peer hoverable resize-none"
            />
            <label htmlFor="message" className="input-label absolute left-0 top-3 text-muted font-mono text-sm transition-all duration-300 pointer-events-none">
              Tell us if you are a learner, institution, or hiring partner
            </label>
          </div>

          <button className="self-start px-8 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hoverable hover:scale-105 transition-transform duration-300 mt-4 flex items-center gap-2">
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
    <footer className="py-12 px-6 border-t border-white/10 mt-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="font-heading text-3xl tracking-widest">
          YANTRA<span className="text-white/50">.</span>
        </div>
        <div className="flex gap-8 font-mono text-xs text-muted uppercase tracking-widest">
          <a href={productLinks.home} className="hover:text-white transition-colors hoverable">
            Platform
          </a>
          <button
            type="button"
            className="hover:text-white transition-colors hoverable"
            onClick={() => openChat({ message: yantraCtaPrompts.demo })}
          >
            Demo
          </button>
          <button
            type="button"
            className="hover:text-white transition-colors hoverable"
            onClick={() => openChat({ message: yantraCtaPrompts.waitlist })}
          >
            Waitlist
          </button>
        </div>
        <div className="font-mono text-xs text-muted/50 uppercase tracking-widest">&copy; {new Date().getFullYear()} Yantra. AI-native learning, built for outcomes.</div>
      </div>
    </footer>
  );
}

export default function MarketingLandingPage() {
  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', `/${window.location.hash}`);
    }
  }, []);

  return (
    <ChatProvider>
      <div className="min-h-screen bg-transparent text-text selection:bg-accent selection:text-white">
        <FluidBackground />
        <CustomCursor />
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
