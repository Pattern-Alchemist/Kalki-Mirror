// =============================================================
// VOL. 2 #17 — A/B Testing Framework
// -------------------------------------------------------------
// Thin experiment layer. No statistical engine — raw counts + a
// heuristic ("significant" when n>100 per variant AND the leading
// variant beats the control by >10% relative conversion).
//
// Assignment: visitor gets a `kalki-exp-${experimentId}` cookie with
// the variant ID. Sticky for 30 days. Reassignment only on experiment
// status change (DRAFT → RUNNING → PAUSED → COMPLETED).
//
// Conversion tracking: reuses the existing AnalyticsEvent table.
// When a visitor assigned to a running experiment fires the metric
// event (e.g. "consultation_started"), the experiment layer also fires
// "experiment_converted" with properties { experimentId, variant, path }.
// =============================================================

import { db } from '@/lib/db';

export interface ExperimentVariant {
  id: string;          // "A" | "B" | "C"
  label: string;       // "Control" | "Shorter headline"
  weight: number;      // 0-100 (must sum to 100 across variants)
}

export interface ExperimentRow {
  id: string;
  name: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  metric: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const COOKIE_PREFIX = 'kalki-exp-';
export const COOKIE_MAX_AGE_SECONDS = 30 * 86_400; // 30 days

/** Parse the variants JSON string into a typed array. */
export function parseVariants(json: string): ExperimentVariant[] {
  try {
    const arr = JSON.parse(json) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((v): v is ExperimentVariant =>
        typeof v === 'object' && v !== null &&
        typeof (v as ExperimentVariant).id === 'string' &&
        typeof (v as ExperimentVariant).label === 'string' &&
        typeof (v as ExperimentVariant).weight === 'number',
      )
      .slice(0, 5); // cap at 5 variants
  } catch {
    return [];
  }
}

/** Serialize a variant array to the JSON string stored in the DB. */
export function serializeVariants(variants: ExperimentVariant[]): string {
  return JSON.stringify(variants.slice(0, 5));
}

/** Validate that variant weights sum to 100. */
export function validateVariantWeights(variants: ExperimentVariant[]): { ok: boolean; error?: string } {
  if (variants.length < 2) return { ok: false, error: 'Need at least 2 variants' };
  if (variants.length > 5) return { ok: false, error: 'Max 5 variants' };
  const sum = variants.reduce((s, v) => s + v.weight, 0);
  if (sum !== 100) return { ok: false, error: `Variant weights must sum to 100 (got ${sum})` };
  const ids = new Set(variants.map(v => v.id));
  if (ids.size !== variants.length) return { ok: false, error: 'Variant IDs must be unique' };
  return { ok: true };
}

/**
 * Deterministically assign a visitor to a variant based on a random
 * seed (the visitor ID or session ID). Uses weighted random selection.
 * Sticky: the same seed always returns the same variant.
 */
export function assignVariant(seed: string, variants: ExperimentVariant[]): ExperimentVariant | null {
  if (variants.length === 0) return null;
  // Hash the seed to a 0-99 integer
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const rand = Math.abs(hash) % 100;
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight;
    if (rand < cumulative) return v;
  }
  return variants[variants.length - 1];
}

/** The cookie name for an experiment. */
export function experimentCookieName(experimentId: string): string {
  return `${COOKIE_PREFIX}${experimentId}`;
}

/** Get all running experiments (for middleware/client-side assignment). */
export async function getRunningExperiments(): Promise<ExperimentRow[]> {
  try {
    const rows = await db.experiment.findMany({
      where: { status: 'RUNNING' },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(r => ({
      ...r,
      status: r.status as ExperimentRow['status'],
      variants: parseVariants(r.variants),
    }));
  } catch {
    return [];
  }
}

/** Get all experiments (for the admin page). */
export async function listExperiments(): Promise<ExperimentRow[]> {
  try {
    const rows = await db.experiment.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(r => ({
      ...r,
      status: r.status as ExperimentRow['status'],
      variants: parseVariants(r.variants),
    }));
  } catch {
    return [];
  }
}

/** Create or update an experiment. */
export async function upsertExperiment(input: {
  id?: string;
  name: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  metric: string;
  status?: ExperimentRow['status'];
}): Promise<ExperimentRow> {
  const validation = validateVariantWeights(input.variants);
  if (!validation.ok) throw new Error(validation.error);
  if (!input.name.trim()) throw new Error('Name is required');
  if (!input.hypothesis.trim()) throw new Error('Hypothesis is required');
  if (!input.metric.trim()) throw new Error('Metric is required');

  const data = {
    name: input.name.trim().slice(0, 200),
    hypothesis: input.hypothesis.trim().slice(0, 1000),
    variants: serializeVariants(input.variants),
    metric: input.metric.trim().slice(0, 100),
    status: input.status ?? 'DRAFT',
  };

  if (input.id) {
    const row = await db.experiment.update({
      where: { id: input.id },
      data,
    });
    return { ...row, status: row.status as ExperimentRow['status'], variants: parseVariants(row.variants) };
  }
  const row = await db.experiment.create({ data });
  return { ...row, status: row.status as ExperimentRow['status'], variants: parseVariants(row.variants) };
}

/** Delete an experiment. */
export async function deleteExperiment(id: string): Promise<void> {
  try {
    await db.experiment.delete({ where: { id } });
  } catch {
    // already gone
  }
}

/** Set the experiment status (DRAFT → RUNNING → PAUSED → COMPLETED). */
export async function setExperimentStatus(id: string, status: ExperimentRow['status']): Promise<void> {
  const data: Record<string, unknown> = { status };
  if (status === 'RUNNING') data.startDate = new Date();
  if (status === 'COMPLETED') data.endDate = new Date();
  await db.experiment.update({ where: { id }, data });
}

// ── Significance heuristic ─────────────────────────────────────────────

export interface VariantStats {
  variantId: string;
  label: string;
  visitors: number;    // assigned (cookie set)
  conversions: number;  // metric events fired
  conversionRate: number; // conversions / visitors
}

export interface ExperimentStats {
  totalVisitors: number;
  totalConversions: number;
  perVariant: VariantStats[];
  leadingVariant: VariantStats | null;
  controlVariant: VariantStats | null;
  /** Heuristic: significant when n>100 per variant AND leading beats control by >10% relative. */
  isSignificant: boolean;
  lift: number | null; // relative lift of leading vs control, as a percentage
}

/**
 * Compute experiment stats from visitor counts + conversion counts.
 * Pure function — the API layer fetches the raw counts and passes them in.
 */
export function computeExperimentStats(
  variants: ExperimentVariant[],
  visitorCounts: Record<string, number>,
  conversionCounts: Record<string, number>,
): ExperimentStats {
  const perVariant: VariantStats[] = variants.map(v => {
    const visitors = visitorCounts[v.id] ?? 0;
    const conversions = conversionCounts[v.id] ?? 0;
    return {
      variantId: v.id,
      label: v.label,
      visitors,
      conversions,
      conversionRate: visitors > 0 ? conversions / visitors : 0,
    };
  });

  const totalVisitors = perVariant.reduce((s, v) => s + v.visitors, 0);
  const totalConversions = perVariant.reduce((s, v) => s + v.conversions, 0);

  // Leading variant = highest conversion rate (min 1 visitor)
  const eligible = perVariant.filter(v => v.visitors > 0);
  const leadingVariant = eligible.length > 0
    ? eligible.reduce((a, b) => a.conversionRate > b.conversionRate ? a : b)
    : null;

  // Control = first variant (id "A" by convention)
  const controlVariant = perVariant[0] ?? null;

  let lift: number | null = null;
  let isSignificant = false;
  if (leadingVariant && controlVariant && controlVariant.conversionRate > 0) {
    lift = ((leadingVariant.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate) * 100;
    const allHaveMinSample = perVariant.every(v => v.visitors >= 100);
    isSignificant = allHaveMinSample && lift > 10;
  }

  return {
    totalVisitors,
    totalConversions,
    perVariant,
    leadingVariant,
    controlVariant,
    isSignificant,
    lift,
  };
}
