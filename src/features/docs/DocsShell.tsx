'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Brain,
  CircleHelp,
  Compass,
  LifeBuoy,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useOverlayLock } from '@/src/features/motion/ExperienceProvider';
import { docsGroups, getDocsArticleBySlug, getDocsArticleHref, getDocsArticlesByGroup, type DocsGroupId } from './docs-content';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';

const DocsSupportWidget = dynamic(() => import('./DocsSupportWidget'), {
  loading: () => null,
});

type DocsShellProps = {
  children: ReactNode;
  activeSlug?: string | null;
  isHome?: boolean;
  showRightRail?: boolean;
  toc?: Array<{
    id: string;
    title: string;
  }>;
};

const groupIcons: Record<DocsGroupId, LucideIcon> = {
  'getting-started': Sparkles,
  product: Brain,
  'account-access': ShieldCheck,
  support: LifeBuoy,
};

function DocsAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#060606]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.07),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(255,255,255,0.05),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,transparent_78%,rgba(255,255,255,0.03))]" />
      <div className="absolute left-[-10%] top-[-14%] h-[28rem] w-[28rem] rounded-full bg-white/[0.045] blur-[110px]" />
      <div className="absolute bottom-[-20%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-white/[0.035] blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '140px 140px',
          maskImage: 'radial-gradient(circle at center, black 32%, transparent 80%)',
        }}
      />
    </div>
  );
}

function DocsTopNav({ isHome }: { isHome: boolean }) {
  const navItems = isHome
    ? [
        { label: 'Docs Home', href: '#top', isAnchor: true },
        { label: 'Quick Start', href: '#quick-start', isAnchor: true },
        { label: 'Product', href: '#product', isAnchor: true },
        { label: 'Support', href: '#support-lane', isAnchor: true },
      ]
    : [
        { label: 'Docs Home', href: '/docs' },
        { label: 'Quick Start', href: '/docs#create-account' },
        { label: 'Product', href: '/docs#product' },
        { label: 'Support', href: '/docs#support-lane' },
      ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/6 bg-black/72 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1680px] items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/docs" className="font-heading text-3xl tracking-widest text-white hoverable">
          YANTRA<span className="text-white/45">.</span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) =>
            'isAnchor' in item && item.isAnchor ? (
              <a
                key={item.label}
                href={item.href}
                data-no-route-loader="true"
                className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/52">Support Library</span>
        </div>
      </div>
    </header>
  );
}

function DocsSidebar({
  activeSlug,
  mobile = false,
  onNavigate,
}: {
  activeSlug?: string | null;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className={mobile ? 'space-y-8' : 'flex h-full flex-col'}>
      <div className={mobile ? 'space-y-2' : 'mb-8 space-y-2'}>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Documentation</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/18">v1.0 / support system</p>
      </div>

      <div className={mobile ? 'space-y-5' : 'space-y-5 overflow-y-auto pr-1'}>
        <Link
          href="/docs"
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-full px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition-all ${
            !activeSlug ? 'bg-white/[0.08] text-white shadow-[0_0_28px_rgba(255,255,255,0.06)]' : 'text-white/48 hover:bg-white/[0.04] hover:text-white'
          }`}
        >
          <Compass size={14} />
          Overview
        </Link>

        {docsGroups.map((group) => {
          const Icon = groupIcons[group.id];
          const articles = getDocsArticlesByGroup(group.id);

          return (
            <section key={group.id} className="space-y-3">
              <div className="flex items-center gap-3 px-3">
                <Icon size={14} className="text-white/34" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">{group.label}</p>
                  <p className="text-xs leading-relaxed text-white/28">{group.description}</p>
                </div>
              </div>

              <div className="space-y-1">
                {articles.map((article) => {
                  const active = activeSlug === article.slug;

                  return (
                    <Link
                      key={article.slug}
                      href={getDocsArticleHref(article.slug)}
                      onClick={onNavigate}
                      className={`block rounded-[1.3rem] px-4 py-3 transition-all ${
                        active ? 'bg-white/[0.08] text-white shadow-[0_0_28px_rgba(255,255,255,0.06)]' : 'text-white/42 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <p className="font-medium text-sm tracking-tight">{article.title}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/22">{article.readTime}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DocsRightRail({ toc }: { toc?: Array<{ id: string; title: string }> }) {
  if (!toc?.length) {
    return (
      <div className="space-y-5 rounded-[2rem] bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">Support Lane</p>
        <p className="text-sm leading-relaxed text-white/60">
          Use this docs area as the primary path for setup, onboarding, account recovery, and platform explanations.
        </p>
        <div className="space-y-3">
          {['common-issues', 'password-reset', 'faq'].map((slug) => {
            const article = getDocsArticleBySlug(slug);

            if (!article) {
              return null;
            }

            return (
              <Link
                key={slug}
                href={getDocsArticleHref(slug)}
                className="block rounded-[1.4rem] border border-white/8 px-4 py-3 transition-colors hover:border-white/16 hover:bg-white/[0.04]"
              >
                <p className="font-medium text-white">{article.title}</p>
                <p className="mt-1 text-sm text-white/42">{article.summary}</p>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-[2rem] bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/34">On This Page</p>
      <div className="space-y-2 border-l border-white/8 pl-4">
        {toc.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            data-no-route-loader="true"
            className={`block font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
              index === 0 ? 'text-white' : 'text-white/34 hover:text-white/70'
            }`}
          >
            {item.title}
          </a>
        ))}
      </div>

      <div className="rounded-[1.4rem] border border-white/8 bg-black/30 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">Need a faster answer?</p>
        <p className="mt-2 text-sm leading-relaxed text-white/58">
          If this page is not enough, jump to the common issues guide or the FAQ and work backwards from the symptom.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/docs/common-issues"
            className="rounded-full border border-white/8 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-white/18 hover:text-white"
          >
            Common Issues
          </Link>
          <Link
            href="/docs/faq"
            className="rounded-full border border-white/8 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-white/18 hover:text-white"
          >
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DocsShell({
  children,
  activeSlug = null,
  isHome = false,
  showRightRail,
  toc,
}: DocsShellProps) {
  const shouldShowRightRail = showRightRail ?? Boolean(toc?.length);



  return (
    <div id="top" className="min-h-screen bg-black text-white">
      <DocsAmbientBackground />
      <DocsTopNav isHome={isHome} />

      <GlobalSidebar className="fixed right-5 top-24 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/72 text-white/70 backdrop-blur-xl transition-colors hover:border-white/20 hover:text-white lg:hidden" />

      <div className="mx-auto max-w-[1620px] px-5 pb-16 pt-24 sm:px-6 lg:px-8">
        <div
          className={`grid gap-8 ${shouldShowRightRail ? 'lg:grid-cols-[264px_minmax(0,1fr)] 2xl:grid-cols-[264px_minmax(0,1fr)_260px]' : 'lg:grid-cols-[264px_minmax(0,1fr)]'}`}
        >
          <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] overflow-hidden rounded-[2rem] bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] lg:block">
            <DocsSidebar activeSlug={activeSlug} />
          </aside>

          <main className="min-w-0">{children}</main>

          {shouldShowRightRail ? (
            <aside className="sticky top-24 hidden h-fit 2xl:block">
              <DocsRightRail toc={toc} />
            </aside>
          ) : null}
        </div>
      </div>

      <DocsSupportWidget activeSlug={activeSlug} />
    </div>
  );
}
