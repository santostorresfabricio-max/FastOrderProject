export interface Product { id:number; name:string; description:string; price:number; category:string; icon:string; popular?:boolean; }
export interface CartLine { key:string; product:Product; quantity:number; notes:string; extras:string[]; unitPrice:number; }
export type OrderStatus='Recibido'|'En preparación'|'Listo para recoger'|'Entregado'|'Cancelado';
export interface Order { id:string; createdAt:string; items:CartLine[]; total:number; type:'Recojo en local'|'Para llevar'; status:OrderStatus; estimateMinutes:number; syncState?:'pendiente'|'confirmado'; }
