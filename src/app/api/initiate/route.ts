import { NextRequest, NextResponse } from 'next/server';
import { getTransitGeometry, formatTransitForPrompt } from '@/lib/ephemeris/transits';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { PATTERN_ARCHETYPE_MAP, getArchetypeById, TEN_MAHAVIDYAS } from '@/lib/data/archetypes';
import { getCautionLevel } from '@/components/archive/CautionBadge';
import type { Tier } from '@/lib/data/types';

/**
 * POST /api/initiate
 * 
 * The Initiation Sequence — one route that chains:
 * 1. Birth coordinates → natal Moon extraction
 * 2. Transit geometry computation → active frictions
 * 3. Pattern matching → dominant karmic loops
 * 4. Archetype classification → Mahāvidyā taxonomy
 * 5. Returns a single Dossier JSON
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, birthPlace, natalMoonDeg, behavioralQuery } = body as {
      birthDate?: string;
      birthTime?: string;
      birthPlace?: string;
      natalMoonDeg?: number;
      behavioralQuery?: string;
    };

    // Validate — at least one input method required
    if (!natalMoonDeg && !behavioralQuery && !birthDate) {
      return NextResponse.json(
        { error: 'Provide birth coordinates (date/time/place), natal Moon degrees, or a behavioral description.' },
        { status: 400 }
      );
    }

    // Step 1: Transit geometry
    const moonDeg = natalMoonDeg || 0;
    const geometry = getTransitGeometry(natalMoonDeg ? moonDeg : undefined);

    // Step 2: Pattern matching
    // In production, this would use the YANTRA LLM analysis.
    // For now, we do keyword-based matching against the Pattern Atlas.
    const query = behavioralQuery || '';
    const q = query.toLowerCase();
    
    let matchedPatterns = allPatterns;
    if (q.length > 0) {
      matchedPatterns = allPatterns.filter(p => {
        const haystack = `${p.name} ${p.subtitle} ${p.description} ${p.signs.join(' ')} ${p.origin} ${p.practice}`.toLowerCase();
        // Score by keyword overlap
        const keywords = q.split(/[\s,;.]+/).filter(w => w.length > 3);
        const score = keywords.reduce((acc, kw) => {
          return acc + (haystack.includes(kw) ? 1 : 0);
        }, 0);
        return score >= 2;
      });
    }
    
    // Take top 3 patterns or default to first 2
    const dominantPatterns = matchedPatterns.slice(0, 3);

    // Step 3: Archetype classification
    const archetypeMap = dominantPatterns.map(p => ({
      pattern: p.slug,
      patternName: p.name,
      archetypeId: PATTERN_ARCHETYPE_MAP[p.slug] || null,
      archetype: PATTERN_ARCHETYPE_MAP[p.slug] ? getArchetypeById(PATTERN_ARCHETYPE_MAP[p.slug]) : null,
    }));

    // Step 4: Find connected siddhis (only OPEN/MODERATE for the dossier)
    const connectedSiddhis = dominantPatterns.flatMap(p => p.relatedSiddhis)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(slug => allSiddhis.find(s => s.slug === slug))
      .filter(Boolean)
      .filter(s => ['Foundation', 'Intermediate'].includes(s!.level))
      .slice(0, 5);

    // Step 5: Compose the Dossier
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

      // Prescribed sādhana (only from OPEN tier — safety constraint)
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

      // Meta
      meta: {
        total_folios_available: allSiddhis.length,
        open_folios: allSiddhis.filter(s => s.level === 'Foundation').length,
        archetype_count: TEN_MAHAVIDYAS.length,
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
