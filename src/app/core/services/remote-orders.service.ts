import { Injectable, signal } from '@angular/core';
import { Order, OrderStatus } from '../models/product.model';
/** Optional JSON-backed Node server. Keeps local orders usable when network is lost. */
@Injectable({providedIn:'root'})
export class RemoteOrdersService {
  readonly serverAvailable=signal(false);
  private stream:EventSource|null=null;
  async list():Promise<Order[]|null>{try{const r=await fetch('/api/pedidos',{cache:'no-store'});if(!r.ok)throw Error(String(r.status));this.serverAvailable.set(true);return await r.json() as Order[];}catch{this.serverAvailable.set(false);return null;}}
  async submit(order:Order):Promise<Order|null>{try{const r=await fetch('/api/pedidos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});if(!r.ok)throw Error(String(r.status));this.serverAvailable.set(true);return await r.json() as Order;}catch{this.serverAvailable.set(false);return null;}}
  async changeStatus(id:string,status:OrderStatus):Promise<Order|null>{try{const r=await fetch('/api/pedidos/'+encodeURIComponent(id)+'/estado',{method:'PATCH',headers:{'Content-Type':'application/json','X-Kitchen-Pin':sessionStorage.getItem('fastorder_kitchen_pin')||''},body:JSON.stringify({status})});if(!r.ok)throw Error(String(r.status));return await r.json() as Order;}catch{return null;}}
  subscribe(onChange:()=>void){if(typeof EventSource==='undefined'||this.stream)return;this.stream=new EventSource('/api/events');this.stream.addEventListener('order',onChange);this.stream.addEventListener('status',onChange);this.stream.onerror=()=>this.serverAvailable.set(false);}
}
