const
  version = '1.0.0',
  CACHE = version + '::VERSION',
  offlineURL = '/offline/',
  installFilesEssential = [
    '/',
    '/manifest.json',
    '/css/style.css',
    '/js/main.js',
    '/js/offline.js',
    '/images/logo/real152.png',
    '/index.html'
  ].concat(offlineURL),
  installFilesDesirable = [
    '/images/logo/logo016.png'
  ];

// install static assets
function installStaticFiles() {

  return caches.open(CACHE)
    .then(cache => {

      // cache desirable files
      cache.addAll(installFilesDesirable);

      // cache essential files
      return cache.addAll(installFilesEssential);

    });

}

// clear old caches
function clearOldCaches() {

  return caches.keys()
    .then(keylist => {

      return Promise.all(
        keylist
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      );

    });

}

// application installation
self.addEventListener('install', event => {

  console.log('service worker: install');

  // cache core files
  event.waitUntil(
    installStaticFiles()
    .then(() => self.skipWaiting())
  );

});

// 安装
// Service Worker 被载入后立即激活可以保证每次 /sw.js 为最新的
self.addEventListener('install', function () {
  self.skipWaiting();
});


// 激活
// application activated
self.addEventListener('activate', event => {

  console.log('service worker: activate');

    // delete old caches
  event.waitUntil(
    clearOldCaches()
    .then(() => self.clients.claim())
    );

});


// is image URL?
// 判断是否是请求图片资源
let iExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].map(f => '.' + f);
function isImage(url) {

  return iExt.reduce((ret, ext) => ret || url.endsWith(ext), false);

}


// return offline asset
function offlineAsset(url) {
  // 对于页面中的图片资源，换成一张自定义的svg图片
  if (isImage(url)) {
    // 如果请求的是图片资源，返回一张svg图片
    // return image
    return new Response(
      '<svg role="img" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title>offline</title><path d="M0 0h400v300H0z" fill="#eee" /><text x="200" y="150" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="50" fill="#ccc">offline</text></svg>',
      { headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store'
      }}
    );

  }
  else {
    // 对于html请求置换为offlineURL页面的缓存，即/offline/
    // return page
    return caches.match(offlineURL);
  }
}


// application fetch network data
self.addEventListener('fetch', event => {

  // abandon non-GET requests
  if (event.request.method !== 'GET') return;

  let url = event.request.url;

  event.respondWith(

    caches.open(CACHE)
      .then(cache => {

        return cache.match(event.request)
          .then(response => {

            if (response) {
              // return cached file
              console.log('cache fetch: ' + url);
              return response;
            }

            // make network request
            return fetch(event.request)
              .then(newreq => {

                console.log('network fetch: ' + url);
                if (newreq.ok) cache.put(event.request, newreq.clone());
                return newreq;

              })
              // app is offline
              .catch(() => offlineAsset(url));

          });

      })

  );

});

// 监听push事件，显示通知
self.addEventListener('push', function (event) {
    if (event.data) {
      var promiseChain = Promise.resolve(event.data.json())
          .then(data => self.registration.showNotification(data.title, {}));
      event.waitUntil(promiseChain);
    }
});
