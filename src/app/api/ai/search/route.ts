export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { allSiddhis } from '@/lib/data/siddhis';
import { getClientIp } from '@/lib/api-auth';
import { aiSearchSchema } from '@/lib/validators/schemas';
import { aiRateLimit } from '@/lib/rate-limit';
import { termAnchor } from '@/lib/utils/term-anchor';


/**
 * POST /api/ai/search
 *
 * Semantic siddhi search — asks the LLM to find the most relevant
 * siddhis from the full catalogue based on a natural-language query.
 *
 * Rate limited: 5 req/min per IP.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isLLMConfigured()) {
      return NextResponse.json(
        { error: 'AI engine is not configured. The geometry awaits calibration.' },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    const { limited } = await aiRateLimit(ip);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = aiSearchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { query, limit } = parsed.data;

    // Build a compact index of siddhi names/sanskrit/categories for the LLM
    const siddhiIndex = allSiddhis.map(s => ({
      slug: s.slug,
      name: s.name,
      sanskrit: s.sanskrit,
      category: s.category,
    }));

    const systemPrompt = `${YANTRA_PERSONA}

Given this list of siddhis, find the ones most relevant to the user's query. Return JSON: { results: [{ slug, name, relevance: one-sentence explanation }] }`;

    const userPrompt = `Siddhis catalogue:
${JSON.stringify(siddhiIndex, null, 0)}

User query: "${query}"

Return the top ${limit} most relevant siddhis. Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        jsonMode: true,
        temperature: 0.3,
        maxTokens: 1024,
      }
    );

    let parsedResponse: { results: { slug: string; name: string; relevance: string }[] };
    try {
      parsedResponse = JSON.parse(result.text);
    } catch {
      return NextResponse.json(
        { error: 'AI response could not be parsed. The geometry returned garbled data.' },
        { status: 502 }
      );
    }

    // Validate that slugs actually exist in our catalogue
    const validSlugs = new Set(allSiddhis.map(s => s.slug));
    const filtered = (parsedResponse.results || []).filter(
      (r) => validSlugs.has(r.slug)
    ).slice(0, limit);

    // Vol. 2 #9 — answer citations: each result carries its canonical folio
    // URL plus the glossary anchor term for its name (term-anchor is the
    // shared derivation), so AI surfaces can deep-link the archive instead
    // of paraphrasing without provenance.
    const citations = filtered.map((r) => ({
      slug: r.slug,
      url: `https://www.astrokalki.com/archive/${r.slug}`,
      term: termAnchor(r.name),
    }));

    return NextResponse.json({
      results: filtered,
      citations,
      query,
    });
  } catch (error) {
    console.error('[/api/ai/search]', error);
    return NextResponse.json(
      { error: 'AI search failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}
