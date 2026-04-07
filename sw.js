const CACHE = 'pariksha-v3'; // Incremented version to force a refresh
const CORE = [
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Using map instead of addAll so one missing file doesn't break the app
      return Promise.allSettled(
        CORE.map(url => cache.add(url).catch(err => console.warn(`Failed to cache: ${url}`, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 1. Skip non-GET requests (Post/Put)
  if (e.request.method !== 'GET') return;

  // 2. STRICTLY EXCLUDE Firebase, Razorpay, and APIs from being cached
  const url = e.request.url;
  if (
    url.includes('firebase') || 
    url.includes('googleapis') || 
    url.includes('razorpay') || 
    url.includes('api.anthropic.com') ||
    url.includes('firestore.googleapis.com')
  ) {
    return; 
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Return cached version OR fetch from network
      return cached || fetch(e.request).then(response => {
        // Only cache valid, same-origin successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE).then(cache => {
          cache.put(e.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Fallback to index if network fails (Offline mode)
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
