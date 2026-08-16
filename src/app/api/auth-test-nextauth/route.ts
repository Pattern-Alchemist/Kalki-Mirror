import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Step-by-step reproduction of authorize
    const email = 'archivist@kalki.mirror';
    const password = 'changeme-immediately';

    const steps: Record<string, string> = {};

    // 1. Direct db query
    try {
      const user = await db.user.findUnique({ where: { email } });
      steps.db_user = user ? `found (${user.role}, hash=${!!user.passwordHash})` : 'NOT FOUND';
    } catch (e: any) {
      steps.db_user = `ERROR: ${e.message.slice(0, 100)}`;
    }

    // 2. Direct authorize call
    try {
      const provider = authOptions.providers.find((p: any) => p.type === 'credentials');
      const result = await provider.authorize({ email, password }, {} as any);
      steps.authorize = result ? `SUCCESS (${result.role})` : 'RETURNED NULL';
    } catch (e: any) {
      steps.authorize = `THREW: ${e.message.slice(0, 200)}`;
    }

    // 3. Raw libsql + bcrypt
    try {
      const { createClient } = await import('@libsql/client');
      const client = createClient({
        url: 'libsql://kalki-mirror-pattern-alchemist.aws-ap-south-1.turso.io',
        authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY5MDk3MDksImlkIjoiMDFhMDBjMWQtMWUwMS03YzFiLTlhYmItODUyZDgwOGRmMWVlIiwia2lkIjoiRHRnLUxVWDlCZ0VHbXVReEk5WVUzWnFqMjRPTUlGQllHZHpqYTBkT0VuUSIsInJpZCI6IjE5MjA2MDJkLTJmNTYtNDA2Yi05MDI2LWUyNTc4ZjUyMDgyMyJ9.0AavPuqz6W7qQtaHgYHscL21-1YgxlRt0DwRLBi-mHjDGemOrNX9gVkP9Ie2Zl7OXLicEDLBV29ZvHdNb9aNAQ',
      });
      const res = await client.execute({ sql: 'SELECT passwordHash FROM "User" WHERE email = ?', args: [email] });
      const hash = res.rows[0]?.passwordHash as string;
      const match = await bcrypt.compare(password, hash);
      steps.raw_libsql = match ? 'MATCH' : 'NO MATCH';
    } catch (e: any) {
      steps.raw_libsql = `ERROR: ${e.message.slice(0, 100)}`;
    }

    // 4. Check if login is locked
    try {
      // Import isLoginLocked by reading the module
      const { isLoginLocked } = await import('@/lib/auth').then(m => {
        // isLoginLocked is not exported, so we'll test via the authorize result
        return { isLoginLocked: () => ({ locked: false }) };
      });
      steps.locked = 'N/A (not exported)';
    } catch (e: any) {
      steps.locked = `ERROR: ${e.message.slice(0, 100)}`;
    }

    return NextResponse.json({ steps });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.slice(0, 500) }, { status: 500 });
  }
}
