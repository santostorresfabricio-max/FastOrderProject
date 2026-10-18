import { Routes } from '@angular/router';
import { CustomerPageComponent } from './features/customer/customer-page.component';
import { KitchenPageComponent } from './features/kitchen/kitchen-page.component';
export const routes: Routes = [
 {path:'',pathMatch:'full',redirectTo:'inicio'},
 {path:'inicio',component:CustomerPageComponent,data:{view:'menu'}},
 {path:'login',component:CustomerPageComponent,data:{view:'login'}},
 {path:'productos',component:CustomerPageComponent,data:{view:'products'}},
 {path:'producto',component:CustomerPageComponent,data:{view:'detail'}},
 {path:'carrito',component:CustomerPageComponent,data:{view:'cart'}},
 {path:'tipo-pedido',component:CustomerPageComponent,data:{view:'orderType'}},
 {path:'confirmacion',component:CustomerPageComponent,data:{view:'confirm'}},
 {path:'seguimiento',component:CustomerPageComponent,data:{view:'tracking'}},
 {path:'pedidos',component:CustomerPageComponent,data:{view:'history'}},
 {path:'perfil',component:CustomerPageComponent,data:{view:'profile'}},
 {path:'offline',component:CustomerPageComponent,data:{view:'offline'}},
 {path:'sincronizacion',component:CustomerPageComponent,data:{view:'sync'}},
 {path:'instalar',component:CustomerPageComponent,data:{view:'install'}},
 {path:'cocina',component:KitchenPageComponent},
 {path:'cocina/pedido/:id',component:KitchenPageComponent,data:{detail:true}},
 {path:'**',redirectTo:'inicio'}
];