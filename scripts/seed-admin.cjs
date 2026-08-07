const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function seed() {
  const email = process.argv[2] || 'archivist@kalki.mirror';
  const password = process.argv[3] || 'kalki-admin-2024';

  const hash = await bcrypt.hash(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: { role: 'SUPERADMIN', passwordHash: hash, name: 'The Archivist' },
    create: {
      email,
      name: 'The Archivist',
      role: 'SUPERADMIN',
      passwordHash: hash,
      goldKeysRemaining: 10,
    },
  });

  console.log(`Admin seeded: ${user.email} (${user.role})`);
  console.log(`Password: ${password}`);
  await db.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
