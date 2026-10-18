import { Injectable } from '@angular/core';
/** Local-only storage: no backend or remote synchronization. */
@Injectable({providedIn:'root'})
export class LocalOrderDb {
 private readonly dbName='fastorder-local-v1';
 private open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(this.dbName,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
 async save(key:string,value:unknown):Promise<void>{if(!('indexedDB' in window))return;const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(value,key);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
 async read<T>(key:string):Promise<T|undefined>{if(!('indexedDB' in window))return undefined;const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readonly');const req=tx.objectStore('snapshots').get(key);req.onsuccess=()=>{db.close();resolve(req.result as T|undefined);};req.onerror=()=>{db.close();reject(req.error);};});}
}
