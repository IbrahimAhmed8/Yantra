'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { AlertTriangle, ArrowLeft, ArrowRight, Lightbulb, ShieldCheck, type LucideIcon } from 'lucide-react';
import DocsShell from './DocsShell';
import {
  getDocsArticleBySlug,
  getDocsArticleHref,
  getDocsPrevNext,
  getVisibleDocsArticleBySlug,
  type DocsBlock,
} from './docs-content';

type DocsCalloutBlock = Extract<DocsBlock, { type: 'callout' }>;

function getSummaryPreview(summary: string, maxLength = 128) {
  if (summary.length <= maxLength) {
    return summary;
  }

  return `${summary.slice(0, maxLength).trimEnd()}...`;
}

function renderBlock(block: DocsBlock, index: number) {
  if (block.type === 'paragraph') {
    return (
      <p key={index} className="text-base leading-relaxed text-white/66 sm:text-[1.05rem]">
        {block.text}
      </p>
    );
  }

  if (block.type === 'list') {
    const ListTag = block.ordered ? 'ol' : 'ul';

    return (
      <ListTag
        key={index}
        className={`space-y-3 pl-5 text-base leading-relaxed text-white/62 ${block.ordered ? 'list-decimal' : 'list-disc'}`}
      >
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === 'steps') {
    return (
      <div key={index} className="grid gap-4 md:grid-cols-2">
        {block.items.map((item, itemIndex) => (
          <div key={item.title} className="rounded-[1.7rem] bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">
              Step {itemIndex + 1}
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/56">{item.body}</p>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'cards') {
    return (
      <div key={index} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {block.items.map((item) => (
          <div key={item.title} className="rounded-[1.7rem] bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
            <h3 className="text-lg font-semibold tracking-tight text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/56">{item.body}</p>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'callout') {
    const toneStyles: Record<
      NonNullable<DocsCalloutBlock['tone']>,
      { icon: LucideIcon; chromeClassName: string; iconClassName: string }
    > = {
      note: {
        icon: Lightbulb,
        chromeClassName: 'bg-white/[0.045]',
        iconClassName: 'border-white/12 bg-white/[0.06] text-white',
      },
      tip: {
        icon: ShieldCheck,
        chromeClassName: 'bg-white/[0.055]',
        iconClassName: 'border-white/12 bg-white text-black',
      },
      warning: {
        icon: AlertTriangle,
        chromeClassName: 'bg-[#181212]',
        iconClassName: 'border-red-300/20 bg-red-500/8 text-red-100',
      },
    };

    const tone = toneStyles[block.tone];
    const Icon = tone.icon;

    return (
      <div key={index} className={`rounded-[1.9rem] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.26)] ${tone.chromeClassName}`}>
        <div className="flex gap-4">
          <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${tone.iconClassName}`}>
            <Icon size={18} />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/34">{block.label}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{block.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{block.body}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={index} className="overflow-hidden rounded-[1.9rem] bg-[#080808] shadow-[0_22px_80px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/34">{block.label}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/18">reference</span>
      </div>
      <pre className="overflow-x-auto px-5 py-5 font-mono text-sm leading-relaxed text-white/70">{block.code}</pre>
    </div>
  );
}

export default function DocsArticlePage({ slug }: { slug: string }) {
  const article = getDocsArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const isArticle = (
    candidate: ReturnType<typeof getVisibleDocsArticleBySlug>,
  ): candidate is NonNullable<ReturnType<typeof getVisibleDocsArticleBySlug>> => Boolean(candidate);
  const { previous, next } = getDocsPrevNext(slug);
  const relatedArticles = article.related.map(getVisibleDocsArticleBySlug).filter(isArticle);
  const toc = article.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  return (
    <DocsShell activeSlug={slug} toc={toc}>
      <motion.article
        initial={{ y: 22 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-12 pb-16"
      >
        <header className="rounded-[2.4rem] bg-white/[0.03] px-6 py-8 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:px-8 lg:px-10 lg:py-10">
          <nav className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/28">
            <Link href="/docs" className="transition-colors hover:text-white/66">
              Docs
            </Link>
            <span>/</span>
            <span>{article.eyebrow}</span>
            <span>/</span>
            <span className="text-white/56">{article.title}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-white/8 bg-black/28 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/48">
              {article.heroLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/8 bg-black/28 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/32">
              {article.readTime}
            </span>
          </div>

          <div className="mt-8 max-w-4xl">
            <h1 className="font-display text-[3rem] font-semibold leading-[0.9] tracking-tight text-white sm:text-[4.5rem] lg:text-[5.6rem]">
              {article.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/60 sm:text-[1.1rem]">{article.summary}</p>
          </div>
        </header>

        <div className="space-y-12">
          {article.sections.map((section, sectionIndex) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[2.2rem] bg-white/[0.03] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:px-8 lg:px-10"
            >
              <div className="pointer-events-none absolute -left-1 top-2 font-display text-[5.5rem] font-semibold text-white/[0.04] sm:text-[7rem]">
                {String(sectionIndex + 1).padStart(2, '0')}
              </div>

              <div className="relative z-10 space-y-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/28">{article.eyebrow}</p>
                  {section.kicker ? (
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">{section.kicker}</p>
                  ) : null}
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[2.4rem]">{section.title}</h2>
                </div>

                <div className="space-y-6">{section.blocks.map((block, index) => renderBlock(block, index))}</div>
              </div>
            </motion.section>
          ))}
        </div>

        {relatedArticles.length > 0 ? (
          <section className="space-y-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">Related Guides</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Keep going</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={getDocsArticleHref(related.slug)}
                  className="rounded-[1.7rem] bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">{related.eyebrow}</p>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{related.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/54">{getSummaryPreview(related.summary, 112)}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 border-t border-white/6 pt-8 md:grid-cols-2">
          {previous ? (
            <Link
              href={getDocsArticleHref(previous.slug)}
              className="group rounded-[1.9rem] bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">Previous</p>
              <div className="mt-3 flex items-center gap-3">
                <ArrowLeft size={16} className="text-white/40 transition-transform duration-300 group-hover:-translate-x-1" />
                <div>
                  <p className="text-lg font-semibold tracking-tight text-white">{previous.title}</p>
                  <p className="mt-1 text-sm text-white/46">{getSummaryPreview(previous.summary, 112)}</p>
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={getDocsArticleHref(next.slug)}
              className="group rounded-[1.9rem] bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1"
            >
              <p className="text-right font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">Next</p>
              <div className="mt-3 flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-lg font-semibold tracking-tight text-white">{next.title}</p>
                  <p className="mt-1 text-sm text-white/46">{getSummaryPreview(next.summary, 112)}</p>
                </div>
                <ArrowRight size={16} className="text-white/40 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          ) : null}
        </div>
      </motion.article>
    </DocsShell>
  );
}
