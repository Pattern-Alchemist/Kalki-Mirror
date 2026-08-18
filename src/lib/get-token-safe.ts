/**
 * Safe session token extraction — wraps getServerSession with error handling.
 * Used by admin layout and API routes to authenticate requests.
 */
import { auth } from './auth-server';

interface SafeToken {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

export async function safeGetToken(): Promise<SafeToken | null> {
  try {
    const session = await auth();
    if (!session?.user) return null;
    return {
      id: (session.user as Record<string, unknown>).id as string | undefined,
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      role: (session.user as Record<string, unknown>).role as string | undefined,
    };
  } catch {
    return null;
  }
}
