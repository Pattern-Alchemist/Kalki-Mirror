import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const provider = authOptions.providers.find((p: any) => p.type === 'credentials');
    const result = await provider.authorize(
      { email: 'archivist@kalki.mirror', password: 'changeme-immediately' },
      {} as any
    );
    return NextResponse.json({ result: result ? { id: result.id, role: result.role } : null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
