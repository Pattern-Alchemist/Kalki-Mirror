import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #1 — saveOutcome (consultation outcome writer)

   The dossier loop's write half. Contract under test:
     · enum gate: only PENDING/IN_PROGRESS/RESOLVED/DISCONTINUED
     · slug lists serialize to the JSON arrays /dossier parses
     · undefined fields stay untouched; empty strings clear
     · RESOLVED/DISCONTINUED stamp completedAt exactly once
     · no-op save is reported, not written
     · audited + webhook fired + bell rung on RESOLVED
   ══════════════════════════════════════════════════════════════ */

const update = vi.fn();
const findUniqueOrThrow = vi.fn();
const logAudit = vi.fn();
const dispatchWebhooks = vi.fn();
const broadcastNotification = vi.fn();

vi.mock('@/lib/db', () => ({
  db: { consultation: { findUniqueOrThrow: (...a: unknown[]) => findUniqueOrThrow(...a), update: (...a: unknown[]) => update(...a) } },
}));
vi.mock('@/lib/admin/audit', () => ({ logAudit: (...a: unknown[]) => logAudit(...a) }));
vi.mock('@/lib/admin/webhook-dispatch', () => ({ dispatchWebhooks: (...a: unknown[]) => dispatchWebhooks(...a) }));
vi.mock('@/lib/admin/notifications', () => ({ broadcastNotification: (...a: unknown[]) => broadcastNotification(...a) }));
vi.mock('@/lib/get-token-safe', () => ({ safeGetToken: vi.fn(async () => ({ id: 'admin-1', role: 'SUPERADMIN' })) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { saveOutcome } from '@/app/admin/(dashboard)/consultations/actions';

function existing(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c-1', name: 'Seeker', status: 'COMPLETED', outcome: null,
    patternDiagnosis: null, prescribedSequence: null, prescribedSiddhis: null,
    sessionNotes: null, followUpDate: null, completedAt: null, updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  update.mockReset().mockResolvedValue({});
  findUniqueOrThrow.mockReset();
  logAudit.mockReset().mockResolvedValue({});
  dispatchWebhooks.mockReset().mockResolvedValue({});
  broadcastNotification.mockReset().mockResolvedValue({});
});

describe('saveOutcome', () => {
  it('rejects an outcome outside the dossier contract', async () => {
    await expect(saveOutcome('c-1', { outcome: 'MIRACULOUSLY_FIXED' as string })).rejects.toThrow(/Invalid outcome/);
  });

  it('serializes comma-separated slugs into the JSON arrays /dossier parses', async () => {
    findUniqueOrThrow.mockResolvedValue(existing());
    await saveOutcome('c-1', { patternSlugs: ' the-rescuer, the-controller ,', siddhiSlugs: 'soham-dhyana' });
    const data = update.mock.calls[0][0].data;
    expect(data.patternDiagnosis).toBe(JSON.stringify(['the-rescuer', 'the-controller']));
    expect(data.prescribedSiddhis).toBe(JSON.stringify(['soham-dhyana']));
  });

  it('empty slug string CLEARS the field (null), undefined leaves it untouched', async () => {
    findUniqueOrThrow.mockResolvedValue(existing({ patternDiagnosis: '["x"]' }));
    await saveOutcome('c-1', { patternSlugs: '', siddhiSlugs: undefined });
    const data = update.mock.calls[0][0].data;
    expect(data.patternDiagnosis).toBeNull();
    expect(data.prescribedSiddhis).toBeUndefined();
  });

  it('stamps completedAt once on RESOLVED and never clobbers an existing one', async () => {
    findUniqueOrThrow.mockResolvedValueOnce(existing());
    await saveOutcome('c-1', { outcome: 'RESOLVED' });
    expect(update.mock.calls[0][0].data.completedAt).toBeInstanceOf(Date);

    const stamp = new Date('2026-01-01T00:00:00Z');
    findUniqueOrThrow.mockResolvedValueOnce(existing({ completedAt: stamp }));
    await saveOutcome('c-1', { outcome: 'RESOLVED' });
    expect(update.mock.calls[1][0].data.completedAt).toBeUndefined();
  });

  it('PENDING does NOT stamp completedAt', async () => {
    findUniqueOrThrow.mockResolvedValue(existing());
    await saveOutcome('c-1', { outcome: 'PENDING' });
    expect(update.mock.calls[0][0].data.completedAt).toBeUndefined();
  });

  it('a save with no effective fields writes nothing', async () => {
    findUniqueOrThrow.mockResolvedValue(existing());
    const res = await saveOutcome('c-1', {});
    expect(res).toEqual({ success: false, reason: 'nothing to update' });
    expect(update).not.toHaveBeenCalled();
  });

  it('RESOLVED rings the bell; audit and webhook always fire on a real save', async () => {
    findUniqueOrThrow.mockResolvedValue(existing());
    await saveOutcome('c-1', { outcome: 'RESOLVED', sessionNotes: 'loop closed' });
    expect(logAudit).toHaveBeenCalledTimes(1);
    expect(logAudit.mock.calls[0][0].action).toBe('consultation.outcome.update');
    expect(dispatchWebhooks).toHaveBeenCalledWith('consultation.outcome', expect.objectContaining({ consultationId: 'c-1', outcome: 'RESOLVED' }));
    expect(broadcastNotification).toHaveBeenCalledTimes(1);
  });

  it('followUpDate parses ISO input and clears on null', async () => {
    findUniqueOrThrow.mockResolvedValue(existing());
    await saveOutcome('c-1', { followUpDate: '2026-09-10T10:00' });
    expect(update.mock.calls[0][0].data.followUpDate).toBeInstanceOf(Date);
    await saveOutcome('c-1', { followUpDate: null });
    expect(update.mock.calls[1][0].data.followUpDate).toBeNull();
  });
});
