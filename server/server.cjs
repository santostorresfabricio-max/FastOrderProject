/** FastOrder academic API: no relational database. JSON file persistence, SSE and optional Web Push. */
'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const PORT=Number(process.env.PORT||8080);
const ROOT=path.resolve(__dirname,'..');
const PUBLIC=path.resolve(ROOT,'dist/fastorder-pwa/browser');
const STORE=path.resolve(__dirname,'data','orders.json');
const ALLOWED=['Recibido','En preparación','Listo para recoger','Entregado','Cancelado'];
let webpush;try{webpush=require('web-push');}catch{webpush=null;}
const VAPID_PUBLIC=process.env.VAPID_PUBLIC_KEY||'';
const VAPID_PRIVATE=process.env.VAPID_PRIVATE_KEY||'';
if(webpush && VAPID_PUBLIC && VAPID_PRIVATE) webpush.setVapidDetails('mailto:'+(process.env.VAPID_EMAIL||'admin@example.com'),VAPID_PUBLIC,VAPID_PRIVATE);
function readData(){try{return JSON.parse(fs.readFileSync(STORE,'utf8'));}catch{return {orders:[],subscriptions:[]};}}
let state=readData();
function save(){fs.mkdirSync(path.dirname(STORE),{recursive:true});const temp=STORE+'.tmp';fs.writeFileSync(temp,JSON.stringify(state,null,2));fs.renameSync(temp,STORE);}
const clients=new Set();
function send(res,status,obj){const body=JSON.stringify(obj);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store'});res.end(body);}
function broadcast(evt,obj){for(const res of clients){try{res.write(`event: ${evt}\ndata: ${JSON.stringify(obj)}\n\n`);}catch{clients.delete(res);}}}
async function notify(order){if(!webpush||!VAPID_PUBLIC||!VAPID_PRIVATE)return;const payload=JSON.stringify({title:'FastOrder · '+order.id,body:'Estado: '+order.status,url:'/seguimiento?id='+encodeURIComponent(order.id)});await Promise.allSettled(state.subscriptions.map(async subscription=>{try{await webpush.sendNotification(subscription,payload);}catch(err){if(err.statusCode===404||err.statusCode===410){state.subscriptions=state.subscriptions.filter(s=>s.endpoint!==subscription.endpoint);save();}}}));}
function body(req){return new Promise((resolve,reject)=>{let str='';req.on('data',chunk=>{str+=chunk;if(str.length>150000){reject(Error('Solicitud demasiado grande'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(str||'{}'));}catch{reject(Error('JSON incorrecto'));}});req.on('error',reject);});}
function validOrder(o){return o&&typeof o.id==='string'&&/^FO-[\w-]{3,70}$/.test(o.id)&&Array.isArray(o.items)&&o.items.length>0&&o.items.length<=50&&o.items.every(l=>Number.isInteger(l.quantity)&&l.quantity>0&&l.quantity<=50&&Number.isFinite(l.unitPrice)&&l.unitPrice>=0&&typeof l.product?.name==='string')&&['Recojo en local','Para llevar'].includes(o.type);}
function mime(file){return ({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream';}
const server=http.createServer(async(req,res)=>{try{
const url=new URL(req.url,'http://localhost');const p=url.pathname;
if(p==='/api/health')return send(res,200,{ok:true,storage:'JSON local (sin BD)',pushEnabled:!!(webpush&&VAPID_PUBLIC&&VAPID_PRIVATE)});
if(p==='/api/menu'&&req.method==='GET'){res.setHeader('Cache-Control','no-cache');return send(res,200,JSON.parse(fs.readFileSync(path.join(ROOT,'public/data/menu.json'),'utf8')));}
if(p==='/api/pedidos'&&req.method==='GET')return send(res,200,state.orders);
if(p==='/api/pedidos'&&req.method==='POST'){const o=await body(req);if(!validOrder(o))return send(res,400,{error:'Pedido inválido'});const old=state.orders.find(x=>x.id===o.id);if(old)return send(res,200,old);const total=o.items.reduce((t,l)=>t+l.quantity*l.unitPrice,0);const record={id:o.id,createdAt:new Date().toISOString(),items:o.items,total:Math.round(total*100)/100,type:o.type,status:'Recibido',estimateMinutes:15};state.orders.unshift(record);save();broadcast('order',record);return send(res,201,record);}
const match=p.match(/^\/api\/pedidos\/([^/]+)\/estado$/);
if(match&&req.method==='PATCH'){if(process.env.KITCHEN_PIN && req.headers['x-kitchen-pin']!==process.env.KITCHEN_PIN)return send(res,403,{error:'PIN de cocina incorrecto'});const order=state.orders.find(x=>x.id===decodeURIComponent(match[1]));if(!order)return send(res,404,{error:'Pedido no encontrado'});const input=await body(req);if(!ALLOWED.includes(input.status))return send(res,400,{error:'Estado inválido'});const current=ALLOWED.indexOf(order.status),next=ALLOWED.indexOf(input.status);if(next!==current+1 && !(input.status==='Cancelado'&&current<3))return send(res,409,{error:'Transición inválida'});order.status=input.status;save();broadcast('status',{id:order.id,status:order.status});void notify(order);return send(res,200,order);}
if(p==='/api/events'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(': connected\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;}
if(p==='/api/push/key'&&req.method==='GET')return send(res,200,{publicKey:VAPID_PUBLIC||null,configured:!!(webpush&&VAPID_PUBLIC&&VAPID_PRIVATE)});
if(p==='/api/push/subscribe'&&req.method==='POST'){const s=await body(req);if(typeof s.endpoint!=='string'||!s.endpoint.startsWith('https://')||!s.keys?.p256dh||!s.keys?.auth)return send(res,400,{error:'Suscripción inválida'});if(!state.subscriptions.some(x=>x.endpoint===s.endpoint))state.subscriptions.push(s);save();return send(res,201,{ok:true});}
if(p.startsWith('/api/'))return send(res,404,{error:'API no encontrada'});
if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'Método no permitido'});
const requestPath=decodeURIComponent(p);const full=path.resolve(PUBLIC,'.'+requestPath);if(!full.startsWith(PUBLIC+path.sep)&&full!==PUBLIC)return send(res,403,{error:'Ruta inválida'});let file=full;
if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(PUBLIC,'index.html');
if(!fs.existsSync(file))return send(res,503,{error:'Primero ejecuta npm run build'});
res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':file.endsWith('index.html')?'no-cache':'public, max-age=3600','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
}catch(err){if(!res.headersSent)send(res,500,{error:'Error interno',details:String(err.message)});}});
server.listen(PORT,()=>console.log(`FastOrder servidor disponible: http://localhost:${PORT} (sin BD relacional)`));
