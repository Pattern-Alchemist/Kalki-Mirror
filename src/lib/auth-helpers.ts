import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { Tier } from "./data/types";
import { TIER_ORDER } from "./utils/tier-gate";

/**
 * Returns the authenticated user's tier from the JWT.
 * Falls back to 'prithvi' for unauthenticated users.
 */
export async function getServerTier(
  request?: NextRequest
): Promise<Tier> {
  try {
    if (!request) return 'prithvi';
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (token?.tier && TIER_ORDER.includes(token.tier as Tier)) {
      return token.tier as Tier;
    }
  } catch {
    // Token read failed — default to lowest tier
  }
  return "prithvi";
}

/**
 * Server-side access check — returns true if userTier >= requiredTier.
 */
export function canAccessTier(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(requiredTier);
}
