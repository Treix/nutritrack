var C='nt-v6';
var SKIP=['anthropic.com','corsproxy.io','openfoodfacts.org','fonts.googleapis.com','fonts.gstatic.com','unpkg.com'];
self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==C;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});
self.addEventListener('fetch',function(e){
  var u=e.request.url;
  for(var i=0;i<SKIP.length;i++){if(u.includes(SKIP[i])){e.respondWith(fetch(e.request).catch(function(){return new Response('',{status:503});}));return;}}
  e.respondWith(caches.match(e.request).then(function(c){
    if(c)return c;
    return fetch(e.request).then(function(r){
      if(r.ok){var cl=r.clone();caches.open(C).then(function(ca){ca.put(e.request,cl);});}
      return r;
    }).catch(function(){return caches.match('/nutritrack/')||caches.match('/nutritrack/index.html');});
  }));
});
