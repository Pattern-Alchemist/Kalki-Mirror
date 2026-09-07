import { describe, it, expect } from 'vitest';
import { EVENT_NAMES, EVENT_META } from '@/lib/analytics-db';

/* ══════════════════════════════════════════════════════════════
   Analytics event dictionary (TGA §12) — completeness guards
   ══════════════════════════════════════════════════════════════ */
describe('Event dictionary', () => {
  it('has exactly the 35 dictionary events (22 TGA §12 + library_entry_viewed Vol. 3 #2 + library_type_viewed Vol. 4 #6 + email_subscribed + 11 ai_* Vol. 4 #17)', () => {
    expect(EVENT_NAMES).toHaveLength(35);
  });

  it('every ai_* route event is prefixed ai_ and unique (Vol. 4 #17)', () => {
    const aiNames = EVENT_NAMES.filter((n) => n.startsWith('ai_'));
    expect(aiNames).toHaveLength(11);
    expect(new Set(aiNames).size).toBe(aiNames.length);
    for (const name of aiNames) {
      expect(EVENT_META[name].label).toMatch(/route called|\/ask answered/);
    }
    // the /ask surface from Vol. 4 #14 must be observable too
    expect(aiNames).toContain('ai_ask');
  });

  it('every event has dashboard metadata (label + group)', () => {
    for (const name of EVENT_NAMES) {
      const meta = EVENT_META[name];
      expect(meta, `EVENT_META missing entry for ${name}`).toBeDefined();
      expect(meta.label.length).toBeGreaterThan(3);
      expect(['Discovery', 'Education', 'Practice', 'Conversion', 'Retention'])
        .toContain(meta.group);
    }
  });

  it('metadata has no orphaned entries beyond the dictionary', () => {
    const metaKeys = Object.keys(EVENT_META);
    expect(metaKeys).toHaveLength(EVENT_NAMES.length);
    for (const key of metaKeys) {
      expect(EVENT_NAMES).toContain(key);
    }
  });

  it('covers all five lattice groups', () => {
    const groups = new Set(EVENT_NAMES.map((n) => EVENT_META[n].group));
    expect([...groups].sort()).toEqual(
      ['Conversion', 'Discovery', 'Education', 'Practice', 'Retention'],
    );
  });
});
