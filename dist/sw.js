// Service Worker for Happenins PWA - Production Resilient & Security Hardened
const CACHE_NAME = "happenins-v4";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg"
];

// Sensitive route patterns that MUST ALWAYS be network-only (NEVER cached)
const NETWORK_ONLY_PATTERNS = [
  /^\/api\//i,
  /^\/auth\//i,
  /^\/oauth\//i,
  /^\/admin\//i,
  /^\/tickets\//i,
  /^\/bookings\//i,
  /^\/organizer\//i,
  /^\/profile/i,
  /razorpay/i,
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("SW install cache.addAll non-fatal warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - purge all old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Guarantees a valid Response is always returned
self.addEventListener("fetch", (event) => {
  // Only handle http/https requests
  if (!event.request.url.startsWith("http")) {
    return;
  }

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // 1. Bypass SW cache completely for non-GET HTTP methods
  if (event.request.method !== "GET") {
    event.respondWith(
      fetch(event.request).catch((err) => {
        return new Response(
          JSON.stringify({ error: "Network request failed", details: err?.message }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // 2. Sensitive routes: Strictly Network-Only (NEVER cached)
  const isSensitive = NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(url.pathname));
  if (isSensitive) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Network connection unavailable for live transaction." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // 3. Navigation requests (SPA page loads / deep links)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const indexFallback = await caches.match("/index.html");
          if (indexFallback) return indexFallback;
          const rootFallback = await caches.match("/");
          if (rootFallback) return rootFallback;
          return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
        })
    );
    return;
  }

  // 4. Same-origin static assets & scripts/styles
  if (isSameOrigin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-while-revalidate in background
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Cache miss -> Fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return safe fallback rather than letting promise reject
            return new Response(null, { status: 404, statusText: "Not Found" });
          });
      })
    );
    return;
  }

  // 5. Cross-origin static resources (Google Fonts, CDNs, Images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        return new Response(null, { status: 404, statusText: "Resource Unavailable" });
      });
    })
  );
});

// Listen for update message from app client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
