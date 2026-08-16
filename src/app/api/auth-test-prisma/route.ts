import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await db.user.findUnique({
      where: { email: 'archivist@kalki.mirror' },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'User not found or no hash', prismaUser: !!user }, { status: 404 });
    }

    const match = await bcrypt.compare('changeme-immediately', user.passwordHash);

    return NextResponse.json({
      email: user.email,
      role: user.role,
      hashPrefix: user.passwordHash.slice(0, 20),
      passwordMatch: match,
      client: 'prisma',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.slice(0, 300) }, { status: 500 });
  }
}
