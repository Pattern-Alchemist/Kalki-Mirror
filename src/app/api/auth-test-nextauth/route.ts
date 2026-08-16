import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const email = 'archivist@kalki.mirror';
  const password = 'changeme-immediately';
  const steps: string[] = [];

  try {
    // Reproduce each step of authorize manually
    steps.push('1. start');

    if (!email || !password) {
      steps.push('FAIL: missing credentials');
      return NextResponse.json({ steps });
    }
    steps.push('2. credentials present');

    // Skip lock check (can't access the function)
    steps.push('3. lock check skipped');

    const user = await db.user.findUnique({ where: { email } });
    steps.push(`4. user=${!!user} hash=${!!user?.passwordHash} role=${user?.role}`);

    if (!user || !user.passwordHash) {
      steps.push('FAIL: no user or no hash');
      return NextResponse.json({ steps });
    }

    const allowedRoles = ['ADMIN', 'SUPERADMIN', 'EDITOR', 'REVIEWER'];
    if (!allowedRoles.includes(user.role as any)) {
      steps.push(`FAIL: role ${user.role} not allowed`);
      return NextResponse.json({ steps });
    }
    steps.push('5. role allowed');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    steps.push(`6. bcrypt valid=${isValid}`);

    if (!isValid) {
      steps.push('FAIL: invalid password');
      return NextResponse.json({ steps });
    }

    steps.push('7. SUCCESS - would return user object');
    return NextResponse.json({ steps, userId: user.id });
  } catch (e: any) {
    steps.push(`EXCEPTION: ${e.message.slice(0, 200)}`);
    return NextResponse.json({ steps }, { status: 500 });
  }
}
