import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

// Prisma 7: driver adapters are mandatory. Seed targets the same dynamic
// store the schema's datasource declares (file:/tmp/kalki-dynamic.db).
const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:/tmp/kalki-dynamic.db',
  }),
});

async function main() {
  console.log('Seeding database...');

  // ── 1. Create SUPERADMIN ──
  const adminEmail = 'archivist@kalki.mirror';
  const adminPassword = 'changeme-immediately'; // CHANGE THIS IN PRODUCTION

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Kaustubh',
        passwordHash,
        role: 'SUPERADMIN',
        tier: 'akash',
        goldKeysRemaining: 10,
      },
    });
    console.log(`  Created SUPERADMIN: ${adminEmail}`);
  } else {
    console.log(`  SUPERADMIN already exists: ${adminEmail}`);
  }

  // ── 2. Create EDITOR ──
  const editorEmail = 'editor@kalki.mirror';
  const existingEditor = await prisma.user.findUnique({ where: { email: editorEmail } });
  if (!existingEditor) {
    const passwordHash = await bcrypt.hash('editor-pass', 12);
    await prisma.user.create({
      data: {
        email: editorEmail,
        name: 'Editor',
        passwordHash,
        role: 'EDITOR',
        tier: 'agni',
        goldKeysRemaining: 3,
      },
    });
    console.log(`  Created EDITOR: ${editorEmail}`);
  } else {
    console.log(`  EDITOR already exists: ${editorEmail}`);
  }

  // ── 3. Create sample invite codes ──
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  const seedCodes = [
    { code: `KALKI-${seg()}-${seg()}`, tierGranted: 'jal' },
    { code: `KALKI-${seg()}-${seg()}`, tierGranted: 'jal' },
    { code: `KALKI-${seg()}-${seg()}`, tierGranted: 'agni' },
  ];

  for (const sc of seedCodes) {
    const exists = await prisma.inviteCode.findUnique({ where: { code: sc.code } });
    if (!exists) {
      await prisma.inviteCode.create({
        data: {
          code: sc.code,
          createdBy: existingAdmin?.id || 'seed',
          tierGranted: sc.tierGranted,
          maxUses: 1,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          active: true,
        },
      });
      console.log(`  Created invite code: ${sc.code} (${sc.tierGranted})`);
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
