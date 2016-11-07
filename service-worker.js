'use strict';

let cacheFileName = "ollieCache-v3";
let cacheCdnName = "ollieCdnCache-v1";

let filesToCache = [
    './',
    './index.html',
    './bundle.js',
    './node_modules/nipplejs/dist/nipplejs.min.js',
    './css/app.css',
    './assets/images/color-wheel.png',
    './assets/images/icon_header_128.png',
    './assets/images/logo.png',
    './assets/images/logo_128.png',
    './assets/images/logo_144.png',
    './assets/images/logo_152.png',
    './assets/images/logo_192.png',
    './assets/images/logo_256.png',
    './assets/images/ollie_connect.jpg',
    './assets/images/ollie_crash.jpg',
    './manifest.json'
];

let cdnToCache = [
  "https://fonts.googleapis.com/",
  "https://code.getmdl.io/",
  "https://fonts.gstatic.com/"  
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheFileName)
            .then(function(cache) {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(filesToCache);
            })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheFileName && key != cacheCdnName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    if (cdnToCache.find((element)=>{return e.request.url.indexOf(element) === 0;})) {
        e.respondWith(
            fetch(e.request)
                .then(function(response) {
                    return caches.open(cacheCdnName).then(function(cache) {
                        cache.put(e.request.url, response.clone());
                        console.log('[ServiceWorker] Fetched&Cached Data');
                        return response;
                    });
                })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});