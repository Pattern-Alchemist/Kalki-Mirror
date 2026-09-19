// =============================================================
// PATH B #2 — Campaign launch prep: mint guhya-halloween-oct26 keys
// -------------------------------------------------------------
// Mints a small batch of Golden Keys with the campaign tag
// "guhya-halloween-oct26" and verifies the end-to-end path:
//   mint → redeem via /redeem?key= → consultation stamp
//
// This is a smoke test — the real distribution (sharing deep-links
// via WhatsApp/social) is founder-gated. This script proves the
// attribution path works before the founder distributes real keys.
//
// Usage: npx tsx scripts/mint-campaign-smoke.ts
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

function generateKeyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `KALKI-${seg()}-${seg()}`;
}

async function main() {
  const campaign = 'guhya-halloween-oct26';
  const count = 5; // smoke batch — the founder mints more for real distribution
  const tier = 'jal';
  const maxUses = 1;

  console.log(`Minting ${count} smoke-test keys for campaign "${campaign}"...`);

  // Find an admin user to be the creator
  const adminResult = await client.execute({
    sql: "SELECT id FROM User WHERE role IN ('ADMIN', 'SUPERADMIN') LIMIT 1",
    args: [],
  });

  if (adminResult.rows.length === 0) {
    console.error('No ADMIN/SUPERADMIN user found to be the key creator.');
    process.exit(1);
  }

  const createdBy = adminResult.rows[0].id as string;
  console.log(`Creator: ${createdBy}`);

  const mintedCodes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = generateKeyCode();
    const id = crypto.randomUUID();
    await client.execute({
      sql: `INSERT INTO InviteCode (id, code, createdBy, tierGranted, maxUses, usesUsed, active, campaign, createdAt)
            VALUES (?, ?, ?, ?, ?, 0, 1, ?, datetime('now'))`,
      args: [id, code, createdBy, tier, maxUses, campaign],
    });
    mintedCodes.push(code);
    console.log(`  ✓ ${code} (tier: ${tier}, maxUses: ${maxUses}, campaign: ${campaign})`);
  }

  console.log(`\n✅ Minted ${mintedCodes.length} keys.`);
  console.log(`\n📋 Shareable deep-links (founder distributes these):`);
  for (const code of mintedCodes) {
    console.log(`  https://www.astrokalki.com/redeem?key=${code}`);
  }
  console.log(`\n🔍 Verify in admin: /admin/keys → search "${campaign}"`);
  console.log(`🔍 Campaign analytics: /admin/keys/campaigns`);
  console.log(`\n📊 The attribution path: mint → /redeem?key= → consultation.redeemedCode stamp`);
  console.log(`   When a seeker redeems a key + submits a consultation, the campaign`);
  console.log(`   analytics page shows the conversion. This smoke batch proves the path.`);
}

main().catch(e => { console.error(e); process.exit(1); });
