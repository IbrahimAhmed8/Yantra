'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navbar } from './components/Navbar';
import { ContributorCard } from './components/ContributorCard';
import { BackgroundEffects } from './components/BackgroundEffects';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { contributors } from './contributors-content';

function iconForContributor(role: string, lanes: string[]) {
  const roleText = `${role} ${lanes.join(' ')}`.toLowerCase();

  if (roleText.includes('backend') || roleText.includes('api') || roleText.includes('data')) {
    return 'infra' as const;
  }

  if (roleText.includes('architecture') || roleText.includes('ui') || roleText.includes('frontend')) {
    return 'code' as const;
  }

  if (roleText.includes('curriculum') || roleText.includes('classroom')) {
    return 'curriculum' as const;
  }

  return 'ai' as const;
}

function MarqueeText() {
  return (
    <div className="my-32 flex w-full rotate-[-2deg] scale-110 items-center overflow-hidden border-y border-white bg-white py-8 text-black shadow-[0_0_50px_rgba(255,255,255,0.2)]">
      <motion.div
        className="font-heading flex whitespace-nowrap text-6xl uppercase tracking-tighter md:text-8xl"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 22 }}
        style={{ willChange: 'transform' }}
      >
        <span className="px-8">JOIN THE BUILD // SHAPE THE FUTURE //</span>
        <span className="px-8">JOIN THE BUILD // SHAPE THE FUTURE //</span>
        <span className="px-8">JOIN THE BUILD // SHAPE THE FUTURE //</span>
        <span className="px-8">JOIN THE BUILD // SHAPE THE FUTURE //</span>
      </motion.div>
    </div>
  );
}

export default function ContributorsExperience() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', prefersReducedMotion ? '4%' : '12%']);

  return (
    <div className="contributors-page relative min-h-screen overflow-x-hidden bg-black font-sans text-white selection:bg-white selection:text-black">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-[100rem] px-4 pb-32 pt-40 sm:px-6 md:px-12">
        <div className="mx-auto mb-24 max-w-7xl md:mb-40">
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-12 h-[1px] max-w-md bg-gradient-to-r from-white/50 to-transparent"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="mb-8 flex flex-wrap items-center gap-4"
          >
            <span className="rounded-full border border-white/20 bg-white/5 px-6 py-2 font-mono text-xs uppercase tracking-[0.3em] text-white backdrop-blur-md sm:text-sm">
              The Collective
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/50 sm:text-sm">
              // {String(contributors.length).padStart(2, '0')} Members
            </span>
          </motion.div>

          <motion.div style={{ y }} className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="font-heading relative z-10 mb-10 text-[15vw] leading-[0.8] tracking-tighter uppercase md:text-[12rem] lg:text-[14rem]"
            >
              THE MINDS
              <br />
              <span className="text-transparent transition-all duration-500 [-webkit-text-stroke:2px_rgba(255,255,255,0.3)] hover:[-webkit-text-stroke:2px_rgba(255,255,255,1)]">
                BEHIND YANTRA.
              </span>
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="max-w-3xl border-l-2 border-white/20 pl-6 text-xl leading-relaxed text-white/60 font-light md:pl-10 md:text-2xl"
          >
            The actual builders behind Yantra across architecture, frontend systems, backend infrastructure,
            scaffolding, documentation, and the shared product shell. No placeholders here.
          </motion.p>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:gap-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            {contributors.map((contributor, index) => (
              <div
                key={contributor.name}
                className={
                  prefersReducedMotion
                    ? ''
                    : index % 4 === 1
                    ? 'md:translate-y-20'
                    : index % 4 === 2
                      ? 'md:-translate-y-8'
                      : index % 4 === 3
                        ? 'md:translate-y-12'
                        : ''
                }
              >
                <ContributorCard
                  name={contributor.name}
                  handle={contributor.handle}
                  role={contributor.role}
                  contributions={contributor.contributions}
                  icon={iconForContributor(contributor.role, contributor.lanes)}
                  commits={contributor.commits}
                  summary={contributor.summary}
                  footprint={contributor.footprint}
                  socials={{}}
                  delay={0.1 + index * 0.08}
                />
              </div>
            ))}
          </div>
        </div>

        <MarqueeText />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="group relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-10 lg:flex-row lg:items-center md:p-24"
        >
          <div className="absolute -right-20 -top-40 h-[40rem] w-[40rem] rounded-full bg-white/5 blur-3xl transition-colors duration-700 group-hover:bg-white/10" />

          <div className="relative z-10 max-w-3xl">
            <h2 className="font-heading mb-8 text-7xl tracking-tight uppercase md:text-9xl">OPEN SOURCE.</h2>
            <p className="text-xl leading-relaxed text-white/60 font-light md:text-2xl">
              We are constantly looking for visionaries to expand the capabilities of Yantra. Contribute to curriculum
              design, core engineering, and AI systems.
            </p>
          </div>
          <button className="group/btn relative z-10 flex items-center gap-4 whitespace-nowrap rounded-full bg-white px-12 py-6 text-xl font-bold tracking-widest text-black uppercase transition-transform duration-300 hover:scale-105">
            VIEW REPOSITORY
            <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-3">→</span>
          </button>
        </motion.div>
      </main>

      <div className="fixed bottom-6 right-6 z-50 md:bottom-10 md:right-10">
        <button className="group/chat flex items-center gap-3 rounded-full border border-white/20 bg-black px-6 py-4 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white hover:bg-white hover:text-black">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white group-hover/chat:bg-black" />
          <span className="font-mono text-xs font-bold tracking-widest uppercase md:text-sm">CHAT WITH YANTRA</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 opacity-50 group-hover/chat:opacity-100"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      <div className="fixed bottom-10 left-10 z-50 hidden h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/50 font-heading text-2xl text-white/50 backdrop-blur-md transition-colors hover:border-white hover:text-white md:flex">
        N
      </div>
    </div>
  );
}
