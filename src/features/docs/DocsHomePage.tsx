'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CircleHelp,
  LayoutDashboard,
  MessageSquareMore,
  Search,
  ShieldCheck,
  Sparkles,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import DocsShell from './DocsShell';
import {
  type DocsArticle,
  docsGroups,
  docsHomeCommonTaskSlugs,
  docsHomeQuickStartSlugs,
  docsHomeSupportSlugs,
  getDocsArticleBySlug,
  getDocsArticleHref,
  getDocsArticlesByGroup,
  searchDocsArticles,
} from './docs-content';

const articleIcons: Record<string, LucideIcon> = {
  welcome: Sparkles,
  'what-is-yantra-ai': Brain,
  'first-dashboard-session': LayoutDashboard,
  'chat-with-yantra': MessageSquareMore,
  'common-issues': CircleHelp,
  'student-profile': ShieldCheck,
  'security-and-privacy': ShieldCheck,
  faq: ShieldCheck,
  'learning-paths-and-voids': Waypoints,
};

function getArticleIcon(slug: string) {
  return articleIcons[slug] ?? BookOpen;
}

function getSummaryPreview(summary: string, maxLength = 108) {
  if (summary.length <= maxLength) {
    return summary;
  }

  return `${summary.slice(0, maxLength).trimEnd()}...`;
}

function DocsActionCard({ slug, large = false }: { slug: string; large?: boolean }) {
  const article = getDocsArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const Icon = getArticleIcon(slug);

  return (
    <Link
      href={getDocsArticleHref(slug)}
      className={`group relative overflow-hidden rounded-[1.8rem] bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-1 ${
        large ? 'min-h-[16rem]' : 'min-h-[13rem]'
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%,rgba(255,255,255,0.02))]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/8 bg-black/28 text-white/82">
            <Icon size={18} />
          </span>
          <ArrowRight size={16} className="text-white/24 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/74" />
        </div>

        <div className="mt-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">{article.eyebrow}</p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{article.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/58">{getSummaryPreview(article.summary, large ? 128 : 96)}</p>
        </div>
      </div>
    </Link>
  );
}

export default function DocsHomePage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isArticle = (article: DocsArticle | null): article is DocsArticle => Boolean(article);

  const searchResults = useMemo(() => searchDocsArticles(deferredQuery), [deferredQuery]);
  const quickStartArticles = docsHomeQuickStartSlugs.map(getDocsArticleBySlug).filter(isArticle);
  const commonTaskArticles = docsHomeCommonTaskSlugs.map(getDocsArticleBySlug).filter(isArticle);
  const supportArticles = docsHomeSupportSlugs.map(getDocsArticleBySlug).filter(isArticle);
  const hasQuery = deferredQuery.trim().length > 0;

  return (
    <DocsShell isHome showRightRail={false}>
      <div className="space-y-24 pb-20">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[2.6rem] bg-white/[0.03] px-6 py-12 shadow-[0_28px_90px_rgba(0,0,0,0.36)] sm:px-8 lg:px-12 lg:py-14"
        >
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.7)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/48">AI-native support system</span>
          </div>

          <div className="mt-8 max-w-5xl">
            <h1 className="font-display text-[3.2rem] font-semibold leading-[0.88] tracking-tight text-white sm:text-[5rem] lg:text-[6.4rem]">
              Documentation
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-relaxed text-white/58 sm:text-lg lg:text-[1.22rem]">
              Everything a learner needs to get started with Yantra, understand the product, use the public dashboard
              and editor, and move through common issues without feeling lost.
            </p>
          </div>

          <div className="mt-10 max-w-3xl">
            <label className="relative block">
              <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/26" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search dashboard, profile, editor, Yantra AI, chat..."
                className="w-full rounded-full border border-white/8 bg-black/28 py-4 pl-14 pr-24 text-sm text-white outline-none transition-colors placeholder:text-white/24 focus:border-white/20"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/24">
                search
              </span>
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {['Open dashboard', 'Update profile', 'Use editor', 'Understand Yantra AI'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/8 bg-black/24 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/42"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.section>

        {hasQuery ? (
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Search Results</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded-full border border-white/8 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/48 transition-colors hover:border-white/18 hover:text-white"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {searchResults.map((article) => (
                  <DocsActionCard key={article.slug} slug={article.slug} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
                <p className="text-2xl font-semibold tracking-tight text-white">No exact match yet.</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/58">
                  Try dashboard, profile, editor, privacy, or chat. Most support questions fall into one of those paths.
                </p>
              </div>
            )}
          </section>
        ) : (
          <>
            <section id="quick-start" className="space-y-6">
              <div className="max-w-3xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Quick Start Protocols</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Start without guessing</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/56 sm:text-base">
                  The cleanest first path: open the dashboard, update your profile, then use chat or the editor when
                  you want a clear next move.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                {quickStartArticles.map((article) => (
                  <DocsActionCard key={article.slug} slug={article.slug} large />
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Most Common Tasks</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">The usual first questions</h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
                {commonTaskArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={getDocsArticleHref(article.slug)}
                    className="rounded-[1.7rem] bg-white/[0.03] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">{article.eyebrow}</p>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{article.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/52">{getSummaryPreview(article.summary)}</p>
                  </Link>
                ))}
              </div>
            </section>

            <div id="product" className="space-y-14">
              {docsGroups.map((group, index) => {
                const articles = getDocsArticlesByGroup(group.id);

                return (
                  <motion.section
                    key={group.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.22 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] px-6 py-8 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:px-8 lg:px-10"
                  >
                    <div className="pointer-events-none absolute -left-4 top-3 font-display text-[7rem] font-semibold text-white/[0.04] sm:text-[9rem]">
                      {group.accent}
                    </div>

                    <div className="relative z-10 grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-12">
                      <div className="space-y-4 xl:pt-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/32">{group.shortLabel}</p>
                        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{group.label}</h2>
                        <p className="text-sm leading-relaxed text-white/56 sm:text-base">{group.description}</p>
                        {group.featureSlugs[0] ? (
                          <Link
                            href={getDocsArticleHref(group.featureSlugs[0])}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-black transition-transform duration-300 hover:scale-[0.98]"
                          >
                            Explore
                            <ArrowRight size={14} />
                          </Link>
                        ) : null}
                      </div>

                      <div className={`grid gap-5 ${index === 0 ? 'md:grid-cols-2 2xl:grid-cols-3' : 'md:grid-cols-2'}`}>
                        {articles.map((article) => (
                          <Link
                            key={article.slug}
                            href={getDocsArticleHref(article.slug)}
                            className="rounded-[1.7rem] bg-black/24 p-6 transition-transform duration-300 hover:-translate-y-1"
                          >
                            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">{article.readTime}</p>
                            <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{article.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/52">{getSummaryPreview(article.summary, 110)}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.section>
                );
              })}
            </div>

            <section id="support-lane" className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[2.4rem] bg-white/[0.04] px-6 py-8 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:px-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/32">Support Lane</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Fast help for setup, profile questions, and confusion
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/56 sm:text-base">
                    Yantra is at its best when the user does not have to guess what broke. Start with the closest symptom,
                    read one short guide, and move back into the dashboard or editor with less noise.
                  </p>

                  <div className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {supportArticles.map((article) => (
                      <Link
                        key={article.slug}
                        href={getDocsArticleHref(article.slug)}
                        className="rounded-[1.6rem] border border-white/8 bg-black/26 p-6 transition-colors hover:border-white/18 hover:bg-black/36"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">{article.eyebrow}</p>
                        <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{article.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/52">{getSummaryPreview(article.summary, 112)}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2.3rem] bg-black/28 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/32">Need a clean first move?</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[1.4rem] bg-white/[0.04] p-4">
                      <p className="font-medium text-white">New here?</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/56">
                        Start with Welcome, then Open Your First Dashboard Session, then Student Profile.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] bg-white/[0.04] p-4">
                      <p className="font-medium text-white">Already blocked?</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/56">
                        Read Common Issues, then FAQ, then Security and Privacy Basics if the symptom is still fuzzy.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] bg-white/[0.04] p-4">
                      <p className="font-medium text-white">Trying to understand Yantra itself?</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/56">
                        Read What Is Yantra AI? and Learning Paths and Voids to understand the product philosophy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DocsShell>
  );
}
