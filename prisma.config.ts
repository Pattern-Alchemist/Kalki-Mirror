import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 CLI configuration.
 *
 * Prisma 7 removed the datasource `url` property from schema files and
 * automatic .env loading — the CLI connection now lives here:
 *   - `datasource.url`   → connection used by `prisma db push` / `migrate`
 *   - `migrations.seed`  → the seed command
 * Runtime connections are unchanged: both clients in src/lib pass driver
 * adapters to the PrismaClient constructor directly.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',

  // Dynamic (Turso/local SQLite) connection for schema pushes.
  // Mirrors the old datasource url: file:/tmp/kalki-dynamic.db
  datasource: {
    url: process.env.DATABASE_URL || 'file:/tmp/kalki-dynamic.db',
  },

  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
