// =============================================================
// PATH B #3 — Create the pricing-headline A/B experiment
// -------------------------------------------------------------
// Inserts the first real experiment into the Experiment table:
//   name: "Pricing Headline A/B"
//   hypothesis: "'Choose Your Path' increases pricing_viewed → consultation_started conversion by 15%"
//   variants: A (Control "The Covenant") 50% / B ("Choose Your Path") 50%
//   metric: consultation_started
//   status: RUNNING
//
// The pricing page reads the assignment via useExperiment() hook.
// Conversion tracking fires 'experiment_converted' when a visitor
// assigned to this experiment triggers consultation_started.
//
// Usage: npx tsx scripts/create-pricing-experiment.ts
// =============================================================

import { createClient } from '@libsql/client';
import crypto from 'crypto';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({ url, authToken: token });

async function main() {
  const id = crypto.randomUUID();
  const name = 'Pricing Headline A/B';
  const hypothesis = "'Choose Your Path' (direct, action-oriented) increases pricing_viewed → consultation_started conversion by 15% vs 'The Covenant' (mystic, established).";
  const variants = JSON.stringify([
    { id: 'A', label: 'Control — The Covenant', weight: 50 },
    { id: 'B', label: 'Variant — Choose Your Path', weight: 50 },
  ]);
  const metric = 'consultation_started';
  const status = 'RUNNING';

  console.log('Creating pricing-headline experiment...');

  // Check if it already exists (idempotent — don't create duplicates)
  const existing = await client.execute({
    sql: "SELECT id FROM Experiment WHERE name = ? AND status = 'RUNNING'",
    args: [name],
  });

  if (existing.rows.length > 0) {
    console.log(`✓ Experiment already exists (id: ${existing.rows[0].id}). No-op.`);
    return;
  }

  await client.execute({
    sql: `INSERT INTO Experiment (id, name, hypothesis, variants, metric, status, startDate, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
    args: [id, name, hypothesis, variants, metric, status],
  });

  console.log(`✅ Experiment created (id: ${id})`);
  console.log(`   Name: ${name}`);
  console.log(`   Status: ${status}`);
  console.log(`   Metric: ${metric}`);
  console.log(`   Variants: A (Control 50%) / B (Choose Your Path 50%)`);
  console.log(`\n🔍 View in admin: /admin/analytics/experiments`);
  console.log(`📊 Conversion data populates as visitors hit /pricing and submit consultations.`);
}

main().catch(e => { console.error(e); process.exit(1); });
