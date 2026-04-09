import { motion, useReducedMotion } from 'motion/react';
import { Github, Linkedin, Twitter, ExternalLink, Code2, Sparkles, Cpu, BookOpen } from 'lucide-react';

interface ContributorProps {
  name: string;
  handle: string;
  role: string;
  contributions: string[];
  icon: 'code' | 'ai' | 'infra' | 'curriculum';
  commits: number;
  summary: string;
  footprint: string;
  socials: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  delay?: number;
  className?: string;
}

const IconMap = {
  code: Code2,
  ai: Sparkles,
  infra: Cpu,
  curriculum: BookOpen,
};

export function ContributorCard({
  name,
  handle,
  role,
  contributions,
  icon,
  commits,
  summary,
  footprint,
  socials,
  delay = 0,
  className = '',
}: ContributorProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = IconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.01 }}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '720px',
        contain: 'layout style paint',
        willChange: 'transform, opacity',
      }}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505]/80 backdrop-blur-sm transition-colors duration-500 hover:border-white/30 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)] opacity-70" />

      <div className="relative z-10 flex h-full flex-col p-8 md:p-12">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="relative inline-block">
            <div className="font-heading relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),rgba(255,255,255,0.02))] text-3xl uppercase shadow-2xl transition-all duration-700 group-hover:border-white/30 sm:h-32 sm:w-32 sm:text-4xl">
              {handle}
            </div>
            <div className="absolute -bottom-2 -right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black text-white shadow-xl transition-all duration-500 group-hover:bg-white group-hover:text-black sm:-bottom-4 sm:-right-4 sm:h-14 sm:w-14">
              <Icon size={24} className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
          <div className="flex gap-2 sm:flex-col">
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black sm:h-12 sm:w-12"
              >
                <Github size={18} />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black sm:h-12 sm:w-12"
              >
                <Twitter size={18} />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black sm:h-12 sm:w-12"
              >
                <Linkedin size={18} />
              </a>
            )}
            {socials.website && (
              <a
                href={socials.website}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/50 transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black sm:h-12 sm:w-12"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>

        <div className="mb-10">
          <h3 className="font-heading group-hover:text-white relative inline-block text-5xl tracking-wide uppercase transition-colors sm:text-6xl md:text-7xl">
            <span className="relative z-10">{name}</span>
            <span className="animate-glitch-1 pointer-events-none absolute left-0 top-0 -ml-1 z-0 opacity-0 mix-blend-screen group-hover:opacity-100 text-red-500">
              {name}
            </span>
            <span className="animate-glitch-2 pointer-events-none absolute left-0 top-0 ml-1 z-0 opacity-0 mix-blend-screen group-hover:opacity-100 text-blue-500">
              {name}
            </span>
          </h3>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 sm:text-sm">{role}</p>
          <p className="mt-4 max-w-[34rem] text-sm leading-7 text-white/56 sm:text-base">{summary}</p>
        </div>

        <div className="flex flex-grow flex-col justify-end">
          <div className="mb-6 h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent" />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h4 className="flex items-center gap-3 font-mono text-xs tracking-widest text-white/50 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50 transition-colors group-hover:bg-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              Contributions
            </h4>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/42">{commits} commits</div>
          </div>
          <ul className="space-y-4">
            {contributions.map((contribution, index) => (
              <li
                key={index}
                className="group/item flex items-start gap-4 text-sm leading-relaxed text-white/60 sm:text-base"
              >
                <span className="mt-1 text-white/20 transition-colors group-hover/item:text-white">▹</span>
                <span className="transition-colors group-hover/item:text-white/90">{contribution}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">Repo footprint</div>
            <div className="mt-3 text-sm leading-7 text-white/62">{footprint}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
