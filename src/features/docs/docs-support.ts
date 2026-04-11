import { getDocsArticleBySlug, getVisibleDocsArticles, type DocsArticle, type DocsBlock } from './docs-content';

export type DocsSupportRole = 'user' | 'assistant';

export type DocsSupportMessage = {
  role: DocsSupportRole;
  content: string;
};

type DocsKnowledgeChunk = {
  slug: string;
  articleTitle: string;
  sectionId: string;
  sectionTitle: string;
  summary: string;
  tags: string[];
  body: string;
};

export const DOCS_SUPPORT_MODEL = 'gemini-2.5-flash';
export const MAX_DOCS_SUPPORT_MESSAGES = 10;
const MAX_DOCS_SUPPORT_MESSAGE_LENGTH = 2500;

export const docsSupportAssistantName = 'Support Desk';

export const docsSupportWelcomeMessage =
  "You're speaking with Support Desk. I can walk you through the dashboard, local profile behavior, editor flow, chat questions, and other docs-based issues.";

export const docsSupportQuickPrompts = [
  'How should I start in the dashboard?',
  'Where is my student profile stored?',
  'How do I use the editor from the dashboard flow?',
  'Why does the dashboard still feel generic or static?',
];

export const docsSupportSystemPrompt = `You are Support Desk, the docs-grounded customer care AI for the Yantra platform.

Identity:
- You are Support Desk.
- You are not Yantra.
- Yantra is the learning and teaching AI inside the product. You are the support and troubleshooting assistant for docs, dashboard flow, profile behavior, editor flow, and product-use clarity.

Core job:
- Help the user solve dashboard, profile, docs, editor, chat-behavior, and product-understanding issues by relying on the provided documentation context.
- Read the supplied docs context carefully and use it as the primary source of truth.
- When useful, point the user to the exact guide title and the next action they should take.

Personality:
- Calm, operational, concise, and support-first.
- More like premium customer care than a teacher.
- Direct about what the user should do next.
- Do not sound academic or philosophical unless the docs explicitly require it.

Response rules:
- Start with the most useful answer or first action, not a long intro.
- Prefer short numbered steps when the user is blocked.
- If the docs context is incomplete, say that clearly instead of inventing behavior.
- If the user asks a broad learning or theory question outside docs/support scope, redirect them to the main Yantra assistant instead of pretending you are the same AI.
- Do not claim to have performed actions or inspected live user data.
- Never describe yourself as Yantra.

Grounding:
- Use the provided docs excerpts as your working context.
- Mention relevant guide titles naturally when they help.
- If no excerpt actually answers the question, say that the docs do not fully cover it yet and give the closest supported next step.`;

function blockToText(block: DocsBlock): string {
  if (block.type === 'paragraph') {
    return block.text;
  }

  if (block.type === 'list') {
    return block.items.join(' ');
  }

  if (block.type === 'steps') {
    return block.items.map((item) => `${item.title}. ${item.body}`).join(' ');
  }

  if (block.type === 'cards') {
    return block.items.map((item) => `${item.title}. ${item.body}`).join(' ');
  }

  if (block.type === 'callout') {
    return `${block.label}. ${block.title}. ${block.body}`;
  }

  return `${block.label}. ${block.code}`;
}

function tokenize(value: string) {
  return Array.from(
    new Set(
      value
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .map((term) => term.trim())
        .filter((term) => term.length > 2),
    ),
  );
}

const docsKnowledgeBase: DocsKnowledgeChunk[] = getVisibleDocsArticles().flatMap((article) =>
  article.sections.map((section) => ({
    slug: article.slug,
    articleTitle: article.title,
    sectionId: section.id,
    sectionTitle: section.title,
    summary: article.summary,
    tags: article.tags,
    body: section.blocks.map(blockToText).join(' '),
  })),
);

function scoreChunk(chunk: DocsKnowledgeChunk, terms: string[], activeSlug?: string | null) {
  const haystack = `${chunk.articleTitle} ${chunk.sectionTitle} ${chunk.summary} ${chunk.tags.join(' ')} ${chunk.body}`.toLowerCase();
  let score = 0;

  if (activeSlug && chunk.slug === activeSlug) {
    score += 4;
  }

  for (const term of terms) {
    if (chunk.articleTitle.toLowerCase().includes(term)) {
      score += 5;
    }

    if (chunk.sectionTitle.toLowerCase().includes(term)) {
      score += 4;
    }

    if (chunk.tags.some((tag) => tag.toLowerCase().includes(term))) {
      score += 4;
    }

    const matches = haystack.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    score += matches ? Math.min(matches.length, 4) : 0;
  }

  return score;
}

export function normalizeDocsSupportMessages(
  messages: unknown,
  limit = MAX_DOCS_SUPPORT_MESSAGES,
): DocsSupportMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message): message is { role?: unknown; content?: unknown } => typeof message === 'object' && message !== null)
    .map((message) => {
      const role = message.role === 'assistant' ? 'assistant' : message.role === 'user' ? 'user' : null;
      const content =
        typeof message.content === 'string' ? message.content.trim().slice(0, MAX_DOCS_SUPPORT_MESSAGE_LENGTH) : '';

      if (!role || content.length === 0) {
        return null;
      }

      return {
        role,
        content,
      } satisfies DocsSupportMessage;
    })
    .filter((message): message is DocsSupportMessage => Boolean(message))
    .slice(-limit);
}

export function searchDocsSupportKnowledge(query: string, activeSlug?: string | null, limit = 5) {
  const terms = tokenize(query);
  const scored = docsKnowledgeBase
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, terms, activeSlug),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (scored.length > 0) {
    return scored.slice(0, limit).map((entry) => entry.chunk);
  }

  if (activeSlug) {
    return docsKnowledgeBase.filter((chunk) => chunk.slug === activeSlug).slice(0, Math.max(1, limit - 1));
  }

  return docsKnowledgeBase.slice(0, limit);
}

export function buildDocsSupportContext(query: string, activeSlug?: string | null) {
  const currentArticle = activeSlug ? getDocsArticleBySlug(activeSlug) : null;
  const chunks = searchDocsSupportKnowledge(query, activeSlug, 5);

  const context = chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] ${chunk.articleTitle} / ${chunk.sectionTitle}\nSummary: ${chunk.summary}\nDetails: ${chunk.body}\nLink: /docs/${chunk.slug}#${chunk.sectionId}`,
    )
    .join('\n\n');

  return {
    currentArticle,
    context,
    sources: Array.from(new Set(chunks.map((chunk) => chunk.slug)))
      .map((slug) => getDocsArticleBySlug(slug))
      .filter((article): article is DocsArticle => Boolean(article))
      .map((article) => ({
        slug: article.slug,
        title: article.title,
      })),
  };
}
