'use client';

import { useDashboardData } from '../DashboardDataContext';
import CurriculumCard from '../components/CurriculumCard';

export default function DashboardCurriculumSection() {
  const { curriculumNodes } = useDashboardData();

  return (
    <div className="mt-14">
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/30">Active Curriculum Nodes</div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {curriculumNodes.map((node, index) => (
          <CurriculumCard key={node.nodeKey} node={node} index={index} />
        ))}
      </div>
    </div>
  );
}
