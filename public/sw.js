var staticCacheName = 'tic-static-v2'

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
      //adding the urls to cache
    caches.open(staticCacheName).then(function(cache) {
      console.log('ServiceWorker is doing it\'s work');
      return cache.addAll(['/','/index.html','/css3.css','/script.js']); //including files that needs to be cached.
    })
  );
});

//changing the new/updated cache if present in the server.
self.addEventListener('activate',  event => {
  //event.waitUntil(self.clients.claim());
    event.waitUntil(
    caches.keys().then(function(cacheNames) {
        return Promise.all(
        cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('tic-')&& cacheName != staticCacheName;
        }).map(function(cacheName) {
            return cache.delete(cacheName);
        })
        );
    })
    );
});
//responding with entry
//or responding with the network if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(
        response => {
        return response || fetch(event.request);
    })
  );
});