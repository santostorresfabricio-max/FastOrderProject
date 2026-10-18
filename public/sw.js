/* FastOrder PWA: offline navigation + static/dynamic runtime caching and Push. */
const VERSION='fastorder-pwa-final-v1';
const SHELL=VERSION+'-shell', RUNTIME=VERSION+'-runtime', MENU=VERSION+'-menu';
const STATIC=['/','/index.html','/manifest.webmanifest','/assets/fastorder-logo.png','/assets/fastorder-icon.png','/assets/pwa-192.png','/assets/pwa-512.png','/assets/burger.jpg','/assets/fries.svg','/assets/drink.svg','/assets/combo.svg','/assets/crispy.svg','/data/menu.json'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(SHELL);
 for(const asset of STATIC){try{await cache.add(asset);}catch{}}
 // Precache Angular's hashed JS/CSS bundles referenced by index.html.
 try{const html=await (await fetch('/index.html',{cache:'reload'})).text();const paths=[...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(m=>new URL(m[1],self.location.origin).pathname);for(const file of paths)try{await cache.add(file);}catch{}}catch{}
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(![SHELL,RUNTIME,MENU].includes(key))await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);if(url.origin!==self.location.origin||req.method!=='GET')return;
 if(url.pathname.startsWith('/api/')&&url.pathname!=='/api/menu')return;
 if(url.pathname==='/api/menu'||url.pathname==='/data/menu.json'){
   event.respondWith((async()=>{const cache=await caches.open(MENU);try{const network=await fetch(req);if(network.ok)await cache.put(req,network.clone());return network;}catch{return await cache.match(req)||new Response('[]',{headers:{'Content-Type':'application/json'}});}})());return;
 }
 if(req.mode==='navigate'){
   event.respondWith((async()=>{try{const response=await fetch(req);if(response.ok)(await caches.open(RUNTIME)).put('/index.html',response.clone());return response;}catch{return await caches.match('/index.html')||new Response('Sin conexión. Abre esta aplicación online una vez para guardarla.',{status:503});}})());return;
 }
 if(/\.(js|css|png|jpe?g|svg|webp|woff2?|webmanifest|ico)$/i.test(url.pathname))event.respondWith((async()=>{const cached=await caches.match(req);if(cached)return cached;const network=await fetch(req);if(network.ok)(await caches.open(RUNTIME)).put(req,network.clone());return network;})());
});
self.addEventListener('sync',event=>{if(event.tag==='fastorder-pending')event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>clients.forEach(c=>c.postMessage({type:'SYNC_ORDERS'}))));});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('push',event=>{let data={};try{data=event.data?.json()||{};}catch{}event.waitUntil(self.registration.showNotification(String(data.title||'FastOrder'),{body:String(data.body||'Actualización de tu pedido'),icon:'/assets/pwa-192.png',data:{url:data.url||'/pedidos'}}));});
self.addEventListener('notificationclick',event=>{event.notification.close();const url=new URL(event.notification.data?.url||'/pedidos',self.location.origin);if(url.origin===self.location.origin)event.waitUntil(self.clients.openWindow(url.href));});
