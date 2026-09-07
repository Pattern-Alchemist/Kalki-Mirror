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
/**
 * Datasource URL for the Prisma CLI (db push / migrate).
 * NOTE (Vol. 4 #7): the CLI's sqlite engine only accepts file: URLs —
 * libsql:// is rejected with P1013, token-append or not. Production
 * schema changes therefore ride the libSQL HTTP pipeline directly
 * (see scripts/restore-drill.mjs for the client pattern): extract the
 * exact DDL via a throwaway local `prisma db push`, then apply it to
 * Turso with the libsql client and verify against sqlite_master.
 */
function resolveDatasourceUrl(): string {
  const raw = process.env.DATABASE_URL || 'file:/tmp/kalki-dynamic.db';
  return raw;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',

  // Dynamic (Turso/local SQLite) connection for schema pushes.
  // Mirrors the old datasource url: file:/tmp/kalki-dynamic.db
  datasource: {
    url: resolveDatasourceUrl(),
  },

  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
