import { describe, it, expect } from 'vitest';
import {
  aghoriCourse,
  COURSE_PHASE_COUNT,
  COURSE_LESSON_COUNT,
  COURSE_META,
} from '@/lib/data/aghori-tantra-course';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { siddhiCategoryLabel, ARCHIVE_FILTER_CATEGORIES } from '@/lib/data/tantra-categories';

/**
 * Canonical-count guards.
 *
 * The founder asked for every number on the site to match the data exactly
 * (lesson counts, phase counts, folio counts). These tests pin the derived
 * constants to the raw data so any future content edit that changes a count
 * surfaces here FIRST, instead of as a stale "N lessons" claim in production.
 */
describe('course counts are derived, not drifted', () => {
  it('exports a phase count that matches the data', () => {
    expect(COURSE_PHASE_COUNT).toBe(aghoriCourse.length);
    expect(COURSE_PHASE_COUNT).toBe(8);
  });

  it('exports a lesson count that equals the sum of per-phase lessons', () => {
    const sum = aghoriCourse.reduce((n, p) => n + p.lessons.length, 0);
    expect(COURSE_LESSON_COUNT).toBe(sum);
    // Current canonical size of the course. If this fails, a lesson was
    // added/removed — update every "N lessons" surface intentionally.
    expect(COURSE_LESSON_COUNT).toBe(54);
  });

  it('has unique lesson ids within every phase', () => {
    for (const phase of aghoriCourse) {
      const ids = phase.lessons.map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('mentions the live lesson count in the course description', () => {
    expect(COURSE_META.description).toContain(`${COURSE_LESSON_COUNT} lessons`);
  });
});

describe('archive counts are derived, not drifted', () => {
  it('exports a siddhi count that matches the data', () => {
    expect(SIDDHI_COUNT).toBe(allSiddhis.length);
  });

  it('every archive filter category label resolves to at least one folio', () => {
    // The archive filter chips are built from live facets; this guard ensures
    // the reference list never contains a label with zero folios behind it
    // (the original "Showing 0 of 0" dead-end bug).
    const labelsInData = new Set(allSiddhis.map((s) => siddhiCategoryLabel(s.category)));
    for (const label of ARCHIVE_FILTER_CATEGORIES) {
      if (label === 'All') continue;
      expect(labelsInData.has(label)).toBe(true);
    }
    // And conversely: every public label in the data is offered by the filter.
    for (const label of labelsInData) {
      expect(ARCHIVE_FILTER_CATEGORIES).toContain(label);
    }
  });

  it('maps legacy English categories to their Sanskrit display labels', () => {
    expect(siddhiCategoryLabel('Ritual')).toBe('Pūjā');
    expect(siddhiCategoryLabel('Meditation')).toBe('Dhyāna');
    expect(siddhiCategoryLabel('Tantra')).toBe('Tantra');
  });
});
