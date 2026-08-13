/**
 * A2: IP allowlist for admin routes.
 * Controlled via ALLOWED_ADMIN_IPS env var (comma-separated CIDR ranges or IPs).
 * If the env var is not set, all IPs are allowed (open mode).
 */

const ALLOWED_IPS_RAW = process.env.ALLOWED_ADMIN_IPS;

let allowedIPs: string[] | null = null;

function parseAllowedIPs(): string[] {
  if (allowedIPs !== null) return allowedIPs;
  if (!ALLOWED_IPS_RAW || ALLOWED_IPS_RAW.trim() === '') {
    allowedIPs = []; // empty = allow all
    return allowedIPs;
  }
  allowedIPs = ALLOWED_IPS_RAW.split(',')
    .map(ip => ip.trim())
    .filter(Boolean);
  return allowedIPs;
}

/**
 * Simple IP matching (exact + CIDR /8, /16, /24, /32).
 * For production, consider ip-range-check npm package.
 */
function ipMatches(ip: string, pattern: string): boolean {
  if (pattern === ip) return true;
  if (!pattern.includes('/')) return false;

  const [range, bits] = pattern.split('/');
  const mask = parseInt(bits, 10);
  if (mask === 0) return true;
  if (mask === 32) return range === ip;

  const ipParts = ip.split('.').map(Number);
  const rangeParts = range.split('.').map(Number);
  const fullMasks = Math.floor(mask / 8);
  const partialMask = mask % 8;

  for (let i = 0; i < fullMasks; i++) {
    if (ipParts[i] !== rangeParts[i]) return false;
  }

  if (partialMask > 0 && fullMasks < 4) {
    const pm = 256 - Math.pow(2, 8 - partialMask);
    if ((ipParts[fullMasks] & pm) !== (rangeParts[fullMasks] & pm)) return false;
  }

  return true;
}

export function isIPAllowed(ip: string): boolean {
  const allowed = parseAllowedIPs();
  if (allowed.length === 0) return true; // no restriction configured
  return allowed.some(pattern => ipMatches(ip, pattern));
}
