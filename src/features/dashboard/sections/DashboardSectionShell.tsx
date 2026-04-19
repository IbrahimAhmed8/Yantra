'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type DashboardSectionShellProps = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function DashboardSectionShell({
  id,
  number,
  eyebrow,
  title,
  description,
  action,
  children,
}: DashboardSectionShellProps) {
  return (
    <motion.section
      id={id}
      className="relative scroll-mt-28 space-y-10 md:space-y-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute -left-1 top-[-4rem] hidden select-none font-display text-[5rem] leading-none text-white/[0.028] sm:block lg:top-[-5rem] lg:text-[8rem] xl:top-[-6.5rem] xl:text-[11rem]">
        {number}
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/38">{eyebrow}</div>
          <h2 className="max-w-4xl font-display text-4xl font-semibold leading-[0.92] text-white md:text-6xl">{title}</h2>
          <p className="max-w-2xl text-base font-light leading-relaxed text-white/56 md:text-lg">{description}</p>
        </div>
        {action}
      </div>

      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}
