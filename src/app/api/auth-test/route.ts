import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@libsql/client';

export const runtime = 'nodejs';

const TURSO_URL = 'libsql://kalki-mirror-pattern-alchemist.aws-ap-south-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY5MDk3MDksImlkIjoiMDFhMDBjMWQtMWUwMS03YzFiLTlhYmItODUyZDgwOGRmMWVlIiwia2lkIjoiRHRnLUxVWDlCZ0VHbXVReEk5WVUzWnFqMjRPTUlGQllHZHpqYTBkT0VuUSIsInJpZCI6IjE5MjA2MDJkLTJmNTYtNDA2Yi05MDI2LWUyNTc4ZjUyMDgyMyJ9.0AavPuqz6W7qQtaHgYHscL21-1YgxlRt0DwRLBi-mHjDGemOrNX9gVkP9Ie2Zl7OXLicEDLBV29ZvHdNb9aNAQ';

export async function GET() {
  try {
    const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
    const res = await client.execute({
      sql: 'SELECT email, passwordHash, role FROM "User" WHERE email = ?',
      args: ['archivist@kalki.mirror'],
    });
    const user = res.rows[0];
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    const match = await bcrypt.compare('changeme-immediately', user.passwordHash as string);
    
    return NextResponse.json({
      email: user.email,
      role: user.role,
      hashPrefix: (user.passwordHash as string).slice(0, 20),
      passwordMatch: match,
      dbDirect: true,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
