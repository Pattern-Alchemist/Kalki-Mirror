import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const envelope = await request.text();
  const pieces = envelope.split('\n');
  const header = JSON.parse(pieces[0]);

  // Only forward transaction events to avoid PII leaks
  if (header.type === 'transaction') {
    return NextResponse.json({ error: 'Transaction events not forwarded' }, { status: 200 });
  }

  // Forward to Sentry
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return NextResponse.json({ error: 'Sentry DSN not configured' }, { status: 200 });
  }

  const sentryUrl = dsn.replace('/store', '/envelope');
  try {
    const response = await fetch(sentryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body: envelope,
    });
    return new NextResponse(response.body, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Failed to forward' }, { status: 200 });
  }
}
