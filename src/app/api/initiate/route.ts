export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getTransitGeometry, formatTransitForPrompt } from '@/lib/ephemeris/transits';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { PATTERN_ARCHETYPE_MAP, getArchetypeById, TEN_MAHAVIDYAS, ALL_ARCHETYPES } from '@/lib/data/archetypes';
import { getCautionLevel, type Tier } from '@/lib/data/types';
import { retrievePrescription, retrieveCitation } from '@/lib/rag/retrieval';
import { buildYantraUserPrompt, YANTRA_SYSTEM_PROMPT } from '@/lib/ai/yantra-prompt';
import { optionalAuth, getClientIp } from '@/lib/api-auth';
import { initiateSchema } from '@/lib/validators/schemas';
import { initiateRateLimit } from '@/lib/rate-limit';


export async function POST(request: NextRequest) {
  try {
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

    // Step 3: RAG retrieval — two pools
    const retrievalQuery = `${q} ${dominantPatterns.map(p => p.description).join(' ')}`.trim();

    let prescriptionChunks: Awaited<ReturnType<typeof retrievePrescription>>['chunks'] = [];
    let citationChunks: Awaited<ReturnType<typeof retrieveCitation>>['chunks'] = [];

    if (retrievalQuery.length > 5) {
      try {
        const [presResult, citeResult] = await Promise.all([
          retrievePrescription(retrievalQuery, { k: 4 }),
          retrieveCitation(retrievalQuery, userTier, { k: 4 }),
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

      // Synthesis layer — YANTRA output (LLM-connected) or pattern-based fallback
      karmic_loop: dominantPatterns.length > 0
        ? `${dominantPatterns[0].description} ${dominantPatterns[0].practice}`.trim()
        : null,

      tantric_citation: citationChunks.length > 0
        ? {
            text: citationChunks[0].text,
            source_slug: citationChunks[0].slug,
            caution: citationChunks[0].caution,
          }
        : null,

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
