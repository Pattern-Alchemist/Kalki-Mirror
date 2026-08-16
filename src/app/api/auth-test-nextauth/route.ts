import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Directly invoke the authorize function from the Credentials provider
    const credentialsProvider = authOptions.providers.find(
      (p: any) => p.type === 'credentials'
    );

    if (!credentialsProvider) {
      return NextResponse.json({ error: 'No credentials provider found' }, { status: 500 });
    }

    const result = await credentialsProvider.authorize(
      { email: 'archivist@kalki.mirror', password: 'changeme-immediately' },
      {} as any
    );

    return NextResponse.json({
      result: result ? { id: result.id, email: result.email, role: result.role } : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.slice(0, 500) }, { status: 500 });
  }
}
