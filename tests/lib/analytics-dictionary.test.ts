import { describe, it, expect } from 'vitest';
import { EVENT_NAMES, EVENT_META } from '@/lib/analytics-db';

/* ══════════════════════════════════════════════════════════════
   Analytics event dictionary (TGA §12) — completeness guards
   ══════════════════════════════════════════════════════════════ */
describe('Event dictionary', () => {
  it('has exactly the 23 dictionary events (22 TGA §12 + library_entry_viewed, Vol. 3 #2)', () => {
    expect(EVENT_NAMES).toHaveLength(23);
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
