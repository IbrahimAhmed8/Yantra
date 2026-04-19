'use client';

import { Lock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { StudentDashboardCurriculumNode } from '../student-dashboard-model';

type CurriculumCardProps = {
  node: StudentDashboardCurriculumNode;
  index: number;
};

export default function CurriculumCard({ node, index }: CurriculumCardProps) {
  return (
    <motion.article
      className={`relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.035] p-6 backdrop-blur-[24px] ${
        node.unlocked ? '' : 'opacity-65 grayscale-[0.15]'
      }`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`h-1.5 w-1.5 rounded-full ${node.unlocked ? 'bg-white' : 'bg-white/20'}`} />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{node.moduleLabel}</span>
      </div>

      <div className="mt-6">
        <h4 className="font-display text-xl font-medium text-white">{node.title}</h4>
        <p className="mt-3 text-sm leading-relaxed text-white/44">{node.description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className={`font-mono text-[9px] uppercase tracking-[0.16em] ${node.unlocked ? 'text-white/60' : 'text-white/36'}`}>
          {node.statusLabel}
        </span>
        {node.unlocked ? <Sparkles size={16} className="text-white/56" /> : <Lock size={16} className="text-white/24" />}
      </div>
    </motion.article>
  );
}
