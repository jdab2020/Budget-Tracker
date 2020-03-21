// const DATASTORE = "my-api-cache-v1";
// const STATICSTORE = "my-static-files-v1";

// const FilesToCache = [
//     "/",
//     "/index.html",
//     "/index.js",
//     "/styles.css",
//     "/icons/icon-192x192.png",
//     "/icons/icon-512x512.png",
// ]
// // install
// self.addEventListener("install", function (event) {
//     event.waitUntil(
//         caches.open(STATICSTORE).then(cache => {
//             console.log("cache opened")
//             return cache.addAll(FilesToCache)
//         })
//     )
//     self.skipWaiting();
// })
// // activate
// self.addEventListener("activate", function (event) {
//     event.waitUntil(
//         caches.keys().then(keyList => {
//             return Promise.all(
//                 keyList.map(key => {
//                     if (key !== DATASTORE && key !== STATICSTORE) {
//                         console.log("Removing old cache data", key);
//                         return caches.delete(key);
//                     }
//                 })
//             );
//         })
//     );

//     self.clients.claim();
// });
// // fetch
// self.addEventListener("fetch", function (event) {
//     if (event.request.url.includes("/api")) {
//         event.respondWith(caches.open(DATASTORE).then(cache => {
//             return fetch(event.request)
//                 .then(response => {
//                     if (response.status === 200) {
//                         caches.put(event.request.url, response.clone())
//                     }
//                     return response
//                 }).catch(err => {
//                     return caches.match(event.request)
//                 })
//         }))
//     }
//     event.respondWith(
//         fetch(event.request).catch(
//             function () {
//                 return caches.match(event.request).then(function (res) {
//                     if (res) return res
//                     else return caches.match("/")
//                 })
//             }
//         )
//     )
// })

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/db.js"
];


const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then(cache => {
                    return fetch(event.request).then(response => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }
});