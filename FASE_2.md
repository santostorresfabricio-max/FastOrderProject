# FastOrder — Fase 2 (frontend local)

## Funciones incluidas
- Catálogo filtrable por categorías y búsqueda.
- Fichas individuales según ID de producto, con extras, observaciones y cantidad.
- Carrito editable con cantidades, eliminación y totales calculados.
- Persistencia local en `localStorage` para carrito y pedidos.
- Checkout de demostración, historial, seguimiento y cambios de estado desde panel de cocina en el mismo navegador.
- Interfaz responsive, branding y diseño preservados de Fase 1.2.

## Límites importantes
Esta versión NO se comunica con un backend, no autentica usuarios, no envía pedidos reales y no dispone de Service Worker, IndexedDB, WebSocket, sincronización offline ni push. `localStorage` sirve para la demostración local únicamente; los pedidos no serán visibles entre dispositivos ni navegadores distintos. No utilizar con clientes reales.

## Cómo probar
1. `npm install` y `npm start`.
2. Visitar `/productos`, abrir un producto, seleccionar extras y cantidad, agregar al carrito.
3. Cambiar cantidades en `/carrito`, finalizar en `/confirmacion`.
4. Comprobar `/pedidos` y `/seguimiento`.
5. En la misma ventana y origen, abrir `/cocina`, seleccionar pedido y actualizar estados. Volver al seguimiento y confirmar el nuevo estado.
6. Refrescar la página y verificar persistencia local.

## Próximo paso
API REST, PostgreSQL, identidad del cliente, permisos/roles y sincronización entre cocina y clientes. Posteriormente PWA offline y notificaciones push.
