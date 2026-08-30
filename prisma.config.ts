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
 * When pointed at Turso (libsql://), the auth token is appended as a query
 * param so `prisma db push` authenticates without a separate driver adapter.
 */
function resolveDatasourceUrl(): string {
  const raw = process.env.DATABASE_URL || 'file:/tmp/kalki-dynamic.db';
  const token = process.env.TURSO_AUTH_TOKEN;
  if (raw.startsWith('libsql://') && token && !raw.includes('auth_token=')) {
    const sep = raw.includes('?') ? '&' : '?';
    return `${raw}${sep}auth_token=${encodeURIComponent(token)}`;
  }
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
