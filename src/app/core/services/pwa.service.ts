import { Injectable, signal, isDevMode } from '@angular/core';

interface InstallPromptEvent extends Event { prompt():Promise<void>; userChoice:Promise<{outcome:string}>; }
@Injectable({providedIn:'root'})
export class PwaService {
  readonly isOnline=signal(typeof navigator==='undefined' ? true : navigator.onLine);
  readonly installAvailable=signal(false);
  readonly updateReady=signal(false);
  readonly notificationPermission=signal(typeof Notification==='undefined' ? 'unsupported' : Notification.permission);
  private deferredInstall:InstallPromptEvent|null=null;
  private registration:ServiceWorkerRegistration|null=null;
  constructor(){
    window.addEventListener('online',()=>this.isOnline.set(true));
    window.addEventListener('offline',()=>this.isOnline.set(false));
    window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();this.deferredInstall=event as InstallPromptEvent;this.installAvailable.set(true);});
    // Production builds serve the worker. Angular's dev server must not register SW.
    if('serviceWorker' in navigator && !isDevMode()){
      window.addEventListener('load',()=>this.registerWorker());
    }
  }
  private async registerWorker(){
    try {this.registration=await navigator.serviceWorker.register('/sw.js');
      if(this.registration.waiting)this.updateReady.set(true);
      this.registration.addEventListener('updatefound',()=>{const worker=this.registration?.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed' && navigator.serviceWorker.controller)this.updateReady.set(true);});});
    }catch(error){console.warn('No se pudo registrar el Service Worker',error);}
  }
  async enableLocalNotifications(){if(typeof Notification==='undefined')return;const permission=await Notification.requestPermission();this.notificationPermission.set(permission);}
  async notifyStatus(id:string,status:string){if(typeof Notification==='undefined' || Notification.permission!=='granted')return;try{if(this.registration && this.registration.active){await this.registration.showNotification(`Pedido ${id}`,{body:`Estado: ${status}`,icon:'/assets/pwa-192.png'});}else new Notification(`FastOrder · ${id}`,{body:`Estado: ${status}`,icon:'/assets/pwa-192.png'});}catch(error){console.warn('Notificación local no disponible',error);}}
  async enablePushNotifications(){
    await this.enableLocalNotifications();
    if(Notification.permission!=='granted'||!('serviceWorker' in navigator))return;
    try{
      const response=await fetch('/api/push/key');if(!response.ok)return;
      const config=await response.json() as {publicKey:string|null;configured:boolean};
      if(!config.configured||!config.publicKey)return;
      const registration=this.registration??await navigator.serviceWorker.ready;
      const key=config.publicKey.replace(/-/g,'+').replace(/_/g,'/');
      const raw=atob(key.padEnd(Math.ceil(key.length/4)*4,'='));
      const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
      const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});
      await fetch('/api/push/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(subscription)});
    }catch(error){console.warn('No se pudo activar Push remoto',error);}
  }
  async promptInstall(){if(!this.deferredInstall)return;await this.deferredInstall.prompt();await this.deferredInstall.userChoice;this.deferredInstall=null;this.installAvailable.set(false);}
  applyUpdate(){navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});this.registration?.waiting?.postMessage({type:'SKIP_WAITING'});}
}
