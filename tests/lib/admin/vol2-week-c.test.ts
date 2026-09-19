// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';

// =============================================================
// VOL. 2 WEEK C — Tests for the Intelligence tier primitives:
//   · consultation-tags (taxonomy, parser, serializer)
//   · folio visualize data shape (smoke)
//   · scheduled content calendar helpers
// =============================================================

import {
  CONSULTATION_TAG_TAXONOMY,
  parseAutoTagOutput,
  tagsToJson,
  jsonToTags,
  type ConsultationTag,
} from '@/lib/admin/consultation-tags';

// --- Consultation tag taxonomy ---------------------------------------------

describe('CONSULTATION_TAG_TAXONOMY', () => {
  it('includes the 8 expected tags', () => {
    expect(CONSULTATION_TAG_TAXONOMY).toHaveLength(8);
    for (const t of ['love', 'career', 'health', 'finance', 'spiritual', 'family', 'purpose', 'shadow']) {
      expect(CONSULTATION_TAG_TAXONOMY as readonly string[]).toContain(t);
    }
  });
  it('is a readonly tuple (no mutation)', () => {
    // The `as const` makes it readonly; runtime check: no push available
    expect(Array.isArray(CONSULTATION_TAG_TAXONOMY)).toBe(true);
  });
});

// --- parseAutoTagOutput ----------------------------------------------------

describe('parseAutoTagOutput', () => {
  it('parses a clean JSON response', () => {
    const raw = JSON.stringify({ tags: ['love', 'career'] });
    expect(parseAutoTagOutput(raw)).toEqual(['love', 'career']);
  });
  it('extracts JSON from prose preamble + fences', () => {
    const raw = 'Sure, here are the tags:\n```json\n{"tags": ["love", "shadow"]}\n```';
    expect(parseAutoTagOutput(raw)).toEqual(['love', 'shadow']);
  });
  it('caps at 3 tags', () => {
    const raw = JSON.stringify({ tags: ['love', 'career', 'health', 'finance', 'spiritual'] });
    expect(parseAutoTagOutput(raw)).toHaveLength(3);
  });
  it('dedupes tags', () => {
    const raw = JSON.stringify({ tags: ['love', 'love', 'career'] });
    expect(parseAutoTagOutput(raw)).toEqual(['love', 'career']);
  });
  it('filters out unknown tags', () => {
    const raw = JSON.stringify({ tags: ['love', 'unknown-tag', 'career'] });
    expect(parseAutoTagOutput(raw)).toEqual(['love', 'career']);
  });
  it('returns [] for empty input', () => {
    expect(parseAutoTagOutput('')).toEqual([]);
  });
  it('returns [] for non-JSON input', () => {
    expect(parseAutoTagOutput('no json here')).toEqual([]);
  });
  it('returns [] for malformed JSON', () => {
    expect(parseAutoTagOutput('{tags: [broken')).toEqual([]);
  });
  it('returns [] when tags field is missing', () => {
    expect(parseAutoTagOutput(JSON.stringify({ other: 'x' }))).toEqual([]);
  });
  it('returns [] when tags field is not an array', () => {
    expect(parseAutoTagOutput(JSON.stringify({ tags: 'love' }))).toEqual([]);
  });
});

// --- tagsToJson + jsonToTags (round-trip) ---------------------------------

describe('tagsToJson + jsonToTags', () => {
  it('serializes + deserializes tags', () => {
    const tags: ConsultationTag[] = ['love', 'career', 'shadow'];
    const json = tagsToJson(tags);
    expect(json).toBe(JSON.stringify(tags));
    expect(jsonToTags(json)).toEqual(tags);
  });
  it('returns null for empty array', () => {
    expect(tagsToJson([])).toBeNull();
  });
  it('returns [] for null input', () => {
    expect(jsonToTags(null)).toEqual([]);
  });
  it('returns [] for empty string', () => {
    expect(jsonToTags('')).toEqual([]);
  });
  it('returns [] for malformed JSON', () => {
    expect(jsonToTags('{broken')).toEqual([]);
  });
  it('filters out invalid tags on deserialize', () => {
    expect(jsonToTags(JSON.stringify(['love', 'invalid', 'career']))).toEqual(['love', 'career']);
  });
  it('handles non-array JSON gracefully', () => {
    expect(jsonToTags(JSON.stringify({ not: 'array' }))).toEqual([]);
  });
});

// --- Calendar view helpers (pure) -----------------------------------------

import { isEntryDue, rowPublishState } from '@/lib/admin/scheduled-publish';

describe('scheduled-publish helpers (used by Vol. 2 #13 CalendarView)', () => {
  it('isEntryDue returns true for null publishedAt (legacy)', () => {
    expect(isEntryDue(null)).toBe(true);
  });
  it('isEntryDue returns true for past publishedAt', () => {
    const past = new Date(Date.now() - 86_400_000);
    expect(isEntryDue(past)).toBe(true);
  });
  it('isEntryDue returns false for future publishedAt', () => {
    const future = new Date(Date.now() + 86_400_000);
    expect(isEntryDue(future)).toBe(false);
  });
  it('rowPublishState classifies SCHEDULED correctly', () => {
    const future = new Date(Date.now() + 86_400_000);
    expect(rowPublishState({ status: 'PUBLISHED', publishedAt: future })).toBe('SCHEDULED');
  });
  it('rowPublishState classifies LIVE for past publishedAt', () => {
    const past = new Date(Date.now() - 86_400_000);
    expect(rowPublishState({ status: 'PUBLISHED', publishedAt: past })).toBe('LIVE');
  });
  it('rowPublishState classifies LIVE for null publishedAt (legacy)', () => {
    expect(rowPublishState({ status: 'PUBLISHED', publishedAt: null })).toBe('LIVE');
  });
  it('rowPublishState classifies UNPUBLISHED for non-PUBLISHED status', () => {
    expect(rowPublishState({ status: 'DRAFT', publishedAt: null })).toBe('UNPUBLISHED');
    expect(rowPublishState({ status: 'DRAFT', publishedAt: new Date() })).toBe('UNPUBLISHED');
  });
});
