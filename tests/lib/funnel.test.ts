import { describe, it, expect } from 'vitest';
import {
  buildFunnelStages,
  buildCampaignRollup,
  buildDoorsRollup,
  pctOf,
  type FunnelCounts,
  type LeadAttributionRow,
} from '@/lib/admin/funnel';

/* ══════════════════════════════════════════════════════════════
   The one funnel that matters (Ch 7.2) — pure stage math guards
   ══════════════════════════════════════════════════════════════ */

const full: FunnelCounts = {
  visitors: 1000,
  wizardStarted: 200,
  submitted: 40,
  triaged: 12,
  booked: 6,
};

describe('pctOf', () => {
  it('computes a one-decimal percent', () => {
    expect(pctOf(1, 8)).toBe(12.5);
    expect(pctOf(40, 200)).toBe(20);
  });

  it('returns null on divide-by-zero and negative wholes', () => {
    expect(pctOf(5, 0)).toBeNull();
    expect(pctOf(5, -10)).toBeNull();
  });

  it('returns null when either side is unknown (null)', () => {
    expect(pctOf(null, 100)).toBeNull();
    expect(pctOf(5, null)).toBeNull();
    expect(pctOf(null, null)).toBeNull();
  });

  it('reports 0 honestly when the part is zero but the whole is not', () => {
    expect(pctOf(0, 100)).toBe(0);
  });
});

describe('buildFunnelStages', () => {
  it('renders the five blueprint stages in order', () => {
    const stages = buildFunnelStages(full);
    expect(stages.map((s) => s.key)).toEqual([
      'visitors',
      'wizardStarted',
      'submitted',
      'triaged',
      'booked',
    ]);
  });

  it('carries the Table 7 question each stage answers', () => {
    const stages = buildFunnelStages(full);
    expect(stages.map((s) => s.question)).toEqual([
      'Reach quality',
      'Hook strength',
      'Page conversion',
      'Triage speed',
      'Revenue committed',
    ]);
  });

  it('computes step conversion against the previous stage', () => {
    const [, wizard, submit, triage, booked] = buildFunnelStages(full);
    expect(wizard.stepPct).toBe(20);       // 200 / 1000
    expect(submit.stepPct).toBe(20);       // 40 / 200
    expect(triage.stepPct).toBe(30);       // 12 / 40
    expect(booked.stepPct).toBe(50);       // 6 / 12
  });

  it('exposes the blueprint single number at stages[2] (wizard → submit)', () => {
    const stages = buildFunnelStages(full);
    expect(stages[2].stepPct).toBe(20);
  });

  it('nulls the first stage step and keeps values verbatim', () => {
    const [visitors] = buildFunnelStages(full);
    expect(visitors.stepPct).toBeNull();
    expect(visitors.value).toBe(1000);
  });

  it('degrades gracefully when the event store is unavailable (nulls)', () => {
    const stages = buildFunnelStages({ ...full, visitors: null, wizardStarted: null });
    expect(stages[0].value).toBeNull();
    expect(stages[0].stepPct).toBeNull();
    expect(stages[1].value).toBeNull();
    // wizard → submit is unknown when wizard count is unknown…
    expect(stages[2].stepPct).toBeNull();
    // …but the CRM-side stages keep their real math.
    expect(stages[2].value).toBe(40);
    expect(stages[3].stepPct).toBe(30);
    expect(stages[4].stepPct).toBe(50);
  });

  it('guards divide-by-zero across every step', () => {
    const stages = buildFunnelStages({
      visitors: 0,
      wizardStarted: 0,
      submitted: 0,
      triaged: 0,
      booked: 0,
    });
    for (const s of stages.slice(1)) expect(s.stepPct).toBeNull();
  });

  it('counts a CANCELLED lead as triaged but never as booked (by construction of inputs)', () => {
    // The route passes triaged = status !== NEW and booked = SCHEDULED|COMPLETED;
    // the stage builder just renders whatever it receives — this test pins the
    // contract that triaged ≥ booked is representable and steps stay honest.
    const stages = buildFunnelStages({
      visitors: 10,
      wizardStarted: 4,
      submitted: 2,
      triaged: 2, // e.g. both were acknowledged, then one cancelled
      booked: 1,
    });
    expect(stages[3].value).toBe(2);
    expect(stages[4].value).toBe(1);
    expect(stages[4].stepPct).toBe(50);
  });
});

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #4 — attribution rollups (campaign board + Doors days)
   ══════════════════════════════════════════════════════════════ */

function lead(partial: Partial<LeadAttributionRow>): LeadAttributionRow {
  return {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    status: 'NEW',
    ...partial,
  };
}

describe('buildCampaignRollup', () => {
  it('groups leads by utm_campaign with honest CRM counts', () => {
    const rows = buildCampaignRollup([
      lead({ utmCampaign: 'doors-email-course', status: 'SCHEDULED' }),
      lead({ utmCampaign: 'doors-email-course', status: 'NEW' }),
      lead({ utmCampaign: 'doors-email-course', status: 'CANCELLED' }),
      lead({ utmCampaign: 'usa-geo-launch', status: 'COMPLETED' }),
    ]);
    expect(rows).toHaveLength(2);
    const doors = rows.find((r) => r.key === 'doors-email-course')!;
    expect(doors).toMatchObject({ submitted: 3, triaged: 2, booked: 1 }); // CANCELLED triages, never books
    const usa = rows.find((r) => r.key === 'usa-geo-launch')!;
    expect(usa).toMatchObject({ submitted: 1, triaged: 1, booked: 1 });
  });

  it('rolls untagged leads into "(untagged)" so totals reconcile', () => {
    const rows = buildCampaignRollup([
      lead({}),
      lead({ utmCampaign: null, utmSource: 'google-ads' }),
      lead({ utmCampaign: '  ' }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ key: '(untagged)', submitted: 3 });
  });

  it('sorts by submitted desc', () => {
    const rows = buildCampaignRollup([
      lead({ utmCampaign: 'small' }),
      lead({ utmCampaign: 'big', status: 'NEW' }),
      lead({ utmCampaign: 'big', status: 'NEW' }),
    ]);
    expect(rows[0].key).toBe('big');
    expect(rows[0].submitted).toBe(2);
  });

  it('returns empty for an empty window', () => {
    expect(buildCampaignRollup([])).toEqual([]);
  });
});

describe('buildDoorsRollup', () => {
  it('returns [] when no lead carries the doors campaign', () => {
    expect(buildDoorsRollup([lead({ utmCampaign: 'other' }), lead({})])).toEqual([]);
  });

  it('groups doors leads by utm_content in calendar order', () => {
    const rows = buildDoorsRollup([
      lead({ utmCampaign: 'doors-email-course', utmContent: 'day-10' }),
      lead({ utmCampaign: 'doors-email-course', utmContent: 'welcome' }),
      lead({ utmCampaign: 'doors-email-course', utmContent: 'day-1', status: 'SCHEDULED' }),
      lead({ utmCampaign: 'doors-email-course', utmContent: 'day-1' }),
    ]);
    expect(rows.map((r) => r.day)).toEqual(['welcome', 'day-1', 'day-10']);
    expect(rows.find((r) => r.day === 'day-1')).toMatchObject({ submitted: 2, booked: 1 });
  });

  it('ignores leads from other campaigns entirely', () => {
    const rows = buildDoorsRollup([
      lead({ utmCampaign: 'doors-email-course', utmContent: 'day-5' }),
      lead({ utmCampaign: 'usa-geo-launch', utmContent: 'day-5' }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].submitted).toBe(1);
  });

  it('buckets doors leads missing utm_content as "(no day tag)"', () => {
    const rows = buildDoorsRollup([lead({ utmCampaign: 'doors-email-course' })]);
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toBe('(no day tag)');
  });
});
