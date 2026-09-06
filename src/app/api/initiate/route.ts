export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getTransitGeometry, formatTransitForPrompt } from '@/lib/ephemeris/transits';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { PATTERN_ARCHETYPE_MAP, getArchetypeById, TEN_MAHAVIDYAS, ALL_ARCHETYPES } from '@/lib/data/archetypes';
import { getCautionLevel, type Tier } from '@/lib/data/types';
import { retrievePrescription, retrieveCitation } from '@/lib/rag/retrieval';
import { bridgeSlugsFor } from '@/lib/rag/pattern-bridge';
import { buildYantraUserPrompt, YANTRA_SYSTEM_PROMPT } from '@/lib/ai/yantra-prompt';
import { synthesizeYantra } from '@/lib/ai/yantra-synthesize';
import { voicePass } from '@/lib/ai/voice-pass';
import { synthesisCacheKey, lookupSynthesis, storeSynthesis, recordSynthesisHit } from '@/lib/ai/synthesis-cache';
import { optionalAuth, getClientIp } from '@/lib/api-auth';
import { initiateSchema } from '@/lib/validators/schemas';
import { initiateRateLimit } from '@/lib/rate-limit';

export const maxDuration = 30;


export async function POST(request: NextRequest) {
  try {
    const startedAt = Date.now();
    // Rate limit
    const ip = getClientIp(request);
    const { limited } = await initiateRateLimit(ip);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const parsed = initiateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { birthDate, birthTime, birthPlace, natalMoonDeg, behavioralQuery } = parsed.data;

    // Tier is derived from session (server-authoritative), NOT from request body.
    // This prevents client-side tier spoofing.
    const token = await optionalAuth(request);
    const userTier = ((token?.tier as string) || 'prithvi') as Tier;

    // Step 1: Transit geometry
    const moonDeg = natalMoonDeg || 0;
    const geometry = getTransitGeometry(natalMoonDeg ? moonDeg : undefined);

    // Step 2: Pattern matching (keyword fallback for pattern selection)
    const query = behavioralQuery || '';
    const q = query.toLowerCase();

    let matchedPatterns = allPatterns;
    if (q.length > 0) {
      matchedPatterns = allPatterns.filter(p => {
        const haystack = `${p.name} ${p.subtitle} ${p.description} ${p.signs.join(' ')} ${p.origin} ${p.practice}`.toLowerCase();
        const keywords = q.split(/[\s,;.]+/).filter(w => w.length > 3);
        const score = keywords.reduce((acc, kw) => acc + (haystack.includes(kw) ? 1 : 0), 0);
        return score >= 2;
      });
    }

    const dominantPatterns = matchedPatterns.slice(0, 3);

    // Step 3: RAG retrieval — two pools.
    // Vol. 1 #16 — behavioral bridge: the seeker's dominant patterns
    // deterministically boost their archetypally-linked folios inside the
    // filtered pools (reorder, never widen).
    const retrievalQuery = `${q} ${dominantPatterns.map(p => p.description).join(' ')}`.trim();
    const boostSlugs = bridgeSlugsFor(dominantPatterns.map(p => p.slug));

    let prescriptionChunks: Awaited<ReturnType<typeof retrievePrescription>>['chunks'] = [];
    let citationChunks: Awaited<ReturnType<typeof retrieveCitation>>['chunks'] = [];

    if (retrievalQuery.length > 5) {
      try {
        const [presResult, citeResult] = await Promise.all([
          retrievePrescription(retrievalQuery, { k: 4, boostSlugs }),
          retrieveCitation(retrievalQuery, userTier, { k: 4, boostSlugs }),
        ]);
        prescriptionChunks = presResult.chunks;
        citationChunks = citeResult.chunks;
      } catch {
        // Retrieval failure — proceed without folio grounding
      }
    }

    // Deduplicate and merge all chunks for the YANTRA context
    const seen = new Set<string>();
    const allRetrievedChunks = [...prescriptionChunks, ...citationChunks]
      .filter(c => {
        const key = `${c.slug}:${c.section}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    // Step 4: Archetype classification
    const archetypeMap = dominantPatterns.map(p => ({
      pattern: p.slug,
      patternName: p.name,
      archetypeId: PATTERN_ARCHETYPE_MAP[p.slug] || null,
      archetype: PATTERN_ARCHETYPE_MAP[p.slug] ? getArchetypeById(PATTERN_ARCHETYPE_MAP[p.slug]) : null,
    }));

    // Step 5: Connected siddhis (OPEN/MODERATE for dossier)
    const connectedSiddhis = dominantPatterns.flatMap(p => p.relatedSiddhis)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(slug => allSiddhis.find(s => s.slug === slug))
      .filter(Boolean)
      .filter(s => ['Foundation', 'Intermediate'].includes(s!.level))
      .slice(0, 5);

    // Step 6: Collect unique archive_refs with caution metadata
    const archiveRefsMap = new Map<string, string>();
    for (const c of allRetrievedChunks) {
      if (!archiveRefsMap.has(c.slug)) archiveRefsMap.set(c.slug, c.caution);
    }
    const archiveRefs = [...archiveRefsMap.keys()];
    const archiveRefsCaution = Object.fromEntries(archiveRefsMap);

    // Step 7: Build the grounded YANTRA prompt (for when LLM is connected)
    const yantraPrompt = buildYantraUserPrompt(query, {
      dominantPatterns: dominantPatterns.map(p => p.name),
      currentTransit: formatTransitForPrompt(geometry),
      folioChunks: allRetrievedChunks.map(c => ({
        slug: c.slug,
        section: c.section,
        caution: c.caution,
        text: c.text,
      })),
      archetypeList: ALL_ARCHETYPES.map(a => ({
        id: a.id,
        name: a.name,
        sanskrit: a.sanskrit,
        pattern: a.pattern,
        bija: a.bija,
      })),
    });

    // Step 7.5 (Tier-1 ③): the LLM connection itself. One OpenRouter call
    // through the fallback chain, strict-JSON, soft-fail — the dossier
    // degrades to the pattern-based synthesis exactly as before.
    // Tier-5 #6: identical geometry is served from SynthesisCache (7-day
    // TTL) instead of re-paying the LLM — a cold cache is the old behaviour.
    let synthesis: {
      source: 'llm' | 'pattern';
      model?: string;
      prescription?: string;
      cited_folios?: string[];
      cached?: boolean;
    } = { source: 'pattern' };
    let llmKarmicLoop: string | null = null;
    let llmCitation: { text: string; source_slug: string; caution: string } | null = null;

    if (process.env.OPENROUTER_API_KEY && allRetrievedChunks.length > 0) {
      const cautionOf = (slug: string) =>
        allRetrievedChunks.find(c => c.slug === slug)?.caution ?? 'OPEN';
      const cacheKey = synthesisCacheKey({
        behavioralQuery: query,
        patterns: dominantPatterns.map(p => ({ name: p.name, subtitle: p.subtitle })),
        folioSlugs: allRetrievedChunks.map(c => c.slug),
        tier: userTier,
      });

      const cached = await lookupSynthesis(cacheKey);
      if (cached) {
        synthesis = {
          source: 'llm',
          model: cached.model,
          prescription: cached.output.prescription_line,
          cited_folios: cached.output.cited_folios,
          cached: true,
        };
        llmKarmicLoop = cached.output.karmic_loop;
        llmCitation = {
          text: cached.output.citation_line,
          source_slug: cached.output.cited_folios[0],
          caution: cautionOf(cached.output.cited_folios[0]),
        };
        recordSynthesisHit(cacheKey);
      } else {
        try {
          const result = await synthesizeYantra({
            behavioralQuery: query,
            patterns: dominantPatterns.map(p => ({ name: p.name, subtitle: p.subtitle })),
            transitSummary: formatTransitForPrompt(geometry),
            folioChunks: allRetrievedChunks.map(c => ({
              slug: c.slug,
              section: c.section,
              caution: c.caution,
              text: c.text,
            })),
          });
          if (result) {
            synthesis = {
              source: 'llm',
              model: result.model,
              prescription: result.output.prescription_line,
              cited_folios: result.output.cited_folios,
            };
            llmKarmicLoop = result.output.karmic_loop;
            llmCitation = {
              text: result.output.citation_line,
              source_slug: result.output.cited_folios[0],
              caution: cautionOf(result.output.cited_folios[0]),
            };
            storeSynthesis(cacheKey, result.output, result.model);
          }
        } catch {
          // soft-fail — the pattern synthesis below is the floor, never a crash
        }
      }
    }

    // Vol. 2 #8 — screener voice pass. The pattern-based floor reads
    // clinical (corpus copy concatenated verbatim). When the LLM synthesis
    // is not serving the karmic loop, lift the floor into the Kaustubh
    // voice (rewrite-only, cached, soft-fail to the raw floor). Gated by a
    // wall-clock guard: a congested day must not blow the 30s maxDuration
    // (synthesis already spent up to 3×20s inside the chain).
    const floorKarmic =
      dominantPatterns.length > 0
        ? `${dominantPatterns[0].description} ${dominantPatterns[0].practice}`.trim()
        : null;
    let voicePassModel: string | null = null;
    let floorVoiceText: string | null = null;
    if (!llmKarmicLoop && floorKarmic && Date.now() - startedAt < 15_000) {
      try {
        const vp = await voicePass(floorKarmic);
        if (vp) {
          floorVoiceText = vp.text;
          voicePassModel = vp.model;
        }
      } catch {
        // soft-fail — the raw floor is the floor, never a crash
      }
    }

    // Step 8: Compose the Dossier
    const dossier = {
      timestamp: geometry.timestamp,
      status: 'dossier_generated',

      // Transit layer
      transit: {
        positions: geometry.positions,
        frictions: geometry.frictions,
        yantra_context: formatTransitForPrompt(geometry),
      },

      // Pattern layer
      patterns: dominantPatterns.map(p => ({
        slug: p.slug,
        name: p.name,
        subtitle: p.subtitle,
        description: p.description,
        signs: p.signs,
        practice: p.practice,
      })),

      // Archetype layer
      archetypes: archetypeMap
        .filter(a => a.archetype !== null)
        .map(a => ({
          id: a.archetype!.id,
          name: a.archetype!.name,
          sanskrit: a.archetype!.sanskrit,
          pattern: a.archetype!.pattern,
          bija: a.archetype!.bija,
          cautionLevel: a.archetype!.cautionLevel,
          image: a.archetype!.image,
        })),

      // RAG layer — the grounding
      rag: {
        retrieval_method: allRetrievedChunks.length > 0 ? 'grounded' : 'fallback',
        prescription_pool_size: prescriptionChunks.length,
        citation_pool_size: citationChunks.length,
        archive_refs: archiveRefs,
        archive_refs_caution: archiveRefsCaution,
      },

      // Prescribed sādhana (OPEN tier only — safety constraint)
      prescribed_sadhana: connectedSiddhis.map(s => ({
        slug: s!.slug,
        name: s!.name,
        sanskrit: s!.sanskrit,
        summary: s!.summary,
        primaryMantra: s!.primaryMantra,
        warnings: s!.warnings,
        level: s!.level,
        cautionLevel: getCautionLevel(s!.level),
      })),

      // Synthesis layer — LLM output (Tier-1 ③), voice-passed floor
      // (Vol. 2 #8), or the raw pattern-based floor
      karmic_loop: llmKarmicLoop ?? (voicePassModel ? floorVoiceText : floorKarmic),

      tantric_citation: llmCitation
        ?? (citationChunks.length > 0
          ? {
              text: citationChunks[0].text,
              source_slug: citationChunks[0].slug,
              caution: citationChunks[0].caution,
            }
          : null),

      // Tier-1 ③ — provenance of the synthesis voice
      synthesis: {
        ...synthesis,
        ...(voicePassModel ? { voicePass: { model: voicePassModel } } : {}),
      },

      // YANTRA prompt (ready for LLM connection)
      yantra_prompt: {
        system_prompt_length: YANTRA_SYSTEM_PROMPT.length,
        user_prompt_length: yantraPrompt.length,
        folio_blocks_injected: allRetrievedChunks.length,
        archetype_list_size: ALL_ARCHETYPES.length,
      },

      // Meta
      meta: {
        total_folios_available: allSiddhis.length,
        open_folios: allSiddhis.filter(s => s.level === 'Foundation').length,
        archetype_count: TEN_MAHAVIDYAS.length,
        chunk_count: archiveRefs.length,
      },
    };

    return NextResponse.json(dossier);
  } catch (error) {
    return NextResponse.json(
      { error: 'Initiation sequence failed. The geometry requires recalibration.' },
      { status: 500 }
    );
  }
}
