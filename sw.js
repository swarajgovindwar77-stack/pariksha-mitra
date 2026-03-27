const CACHE = 'pariksha-v2';
const CORE = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('api.anthropic.com') || e.request.url.includes('firebaseapp.com') || e.request.url.includes('googleapis.com') || e.request.url.includes('razorpay.com')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r => { if(!r||r.status!==200||r.type!=='basic') return r; const c=r.clone(); caches.open(CACHE).then(cache=>cache.put(e.request,c)); return r; }).catch(() => caches.match('/index.html'))));
});
