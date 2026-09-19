import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;
if (!url || !token) { console.error('Missing env'); process.exit(1); }
const c = createClient({ url, authToken: token });

async function main() {
  const r = await c.execute('SELECT slug, subject, isPublic, sentAt FROM Letter ORDER BY sentAt');
  console.log('Letters in DB:', r.rows.length);
  for (const row of r.rows) {
    console.log(' ', row.slug, '| public:', row.isPublic, '| sent:', row.sentAt);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
