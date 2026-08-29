import type { MetadataRoute } from 'next';

/**
 * KALKI robots policy — Engine I · Address (Dossier No. 03, §3.1).
 *
 * The public surface is open to every AI crawler BY NAME. Generative
 * engines (ChatGPT, Perplexity, Claude, Gemini, Copilot) are the
 * discovery channel for this genre; welcoming them explicitly is a
 * visibility decision, not a courtesy. Private surfaces stay
 * disallowed for everyone, including AI.
 */

const AI_CRAWLERS = [
  // OpenAI — training, search, and user-initiated fetches
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  // Perplexity — indexing and live retrieval
  'PerplexityBot',
  'Perplexity-User',
  // Google — Gemini training (Googlebot itself is covered by '*')
  'Google-Extended',
  // Apple Intelligence
  'Applebot-Extended',
  // Common Crawl — corpus used by many open models
  'CCBot',
  // Meta AI
  'Meta-ExternalAgent',
  // Amazon
  'Amazonbot',
  // Cohere
  'cohere-ai',
];

const PRIVATE_SURFACES = [
  '/api/',
  '/admin/',
  '/practice',
  '/practice/japa',
  '/practice/timer',
  '/redeem',
  '/dossier',
];

export default function robots(): MetadataRoute.Robots {
  const aiRules: MetadataRoute.Robots['rules'] = AI_CRAWLERS.map((userAgent) => ({
    userAgent,
    allow: '/',
    disallow: PRIVATE_SURFACES,
  }));

  return {
    rules: [
      // Classical search engines — everything public
      { userAgent: '*', allow: '/', disallow: PRIVATE_SURFACES },
      // Generative engines — named and welcomed
      ...aiRules,
    ],
    sitemap: 'https://www.astrokalki.com/sitemap.xml',
    // llms.txt is linked here so every crawler that reads robots.txt
    // also discovers the curated machine surface.
    host: 'https://www.astrokalki.com',
  };
}
