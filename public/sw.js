/* =============================================================
 * KALKI — service worker (Tier-3 ⑤ PWA shell, roadmap #15)
 * -------------------------------------------------------------
 * Policy: the corpus is static by nature — folios, patterns,
 * breathwork and sequences are perfect offline companions for
 * returning practitioners. Everything private or volatile stays
 * strictly online.
 *
 *   navigations   → network-first, cache copy as fallback,
 *                   /offline.html as the last resort
 *   static assets → stale-while-revalidate (immutable _next/static,
 *                   Cloudinary folio images)
 *   never cached  → /api/*, /admin*, /dossier (intake privacy),
 *                   upi:// handoffs are links, not requests
 *
 * Zero dependencies, versioned cache, no push, no background sync.
 * ============================================================= */

const VERSION = 'kalki-v1';
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = '/offline.html';

const PRECACHE = [
  OFFLINE_URL,
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/logo.svg' ||
    url.pathname === '/kalki-yantra.svg' ||
    url.pathname.startsWith('/icon-') ||
    // Cloudinary folio imagery — immutable URLs (f_auto/q_auto change by
    // accept header, so cache per-URL is still stable per variant)
    url.hostname === 'res.cloudinary.com'
  );
}

function isNeverCache(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/dossier') ||
    url.pathname.startsWith('/redeem')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isNeverCache(url)) return;

  // Navigations → network-first, fall back to cached copy, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL) || Response.error();
        })
    );
    return;
  }

  // Static assets → stale-while-revalidate.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const refresh = fetch(request)
          .then((response) => {
            if (response && (response.status === 200 || response.type === 'opaque')) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached);
        return cached || refresh;
      })
    );
  }
});
