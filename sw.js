const CACHE_NAME = 'contador-luz-v1';

const ARCHIVOS_A_CACHEAR = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    'https://cdn.jsdelivr.net/npm/chart.js'
];


self.addEventListener('install', function(evento) {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Caché abierto, guardando archivos');
                return cache.addAll(ARCHIVOS_A_CACHEAR);
            })
    );
});


self.addEventListener('fetch', function(evento) {
    evento.respondWith(
        caches.match(evento.request)
            .then(function(respuesta) {
                if (respuesta) {
                    return respuesta;
                }
                return fetch(evento.request);
            })
    );
});

self.addEventListener('activate', function(evento) {
    evento.waitUntil(
        caches.keys().then(function(nombresCache) {
            return Promise.all(
                nombresCache.map(function(nombreCache) {
                    if (nombreCache !== CACHE_NAME) {
                        return caches.delete(nombreCache);
                    }
                })
            );
        })
    );
});