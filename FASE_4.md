# FastOrder Fase 4 — PWA (sin base de datos relacional)

## Corrección de imágenes
Las fotos/ilustraciones se sirven desde `public/assets/`. No hay dependencias de Unsplash en el frontend. La foto de hamburguesa es un recorte de la captura de FastOrder proporcionada en la conversación; las otras imágenes son ilustraciones SVG locales.

## PWA
- Manifiesto e iconos 192/512px.
- Service Worker en `public/sw.js` con precaché de rutas/recursos, caché de assets y fallback de navegación al `index.html`.
- El SW se registra solo en compilación de producción (`ng build`) servida en HTTPS o localhost; **no se registra en ng serve** para evitar confundir las pruebas de desarrollo.
- Banner de conexión en tiempo real y aviso de nueva versión.
- Botón de instalación cuando el navegador emite `beforeinstallprompt`; algunos navegadores requieren usar su menú.
- Carrito, historial y estados de pedidos se guardan en `localStorage` con copia de respaldo local en IndexedDB, sin BD ni servidor.

## Límites explícitos
1. `localStorage` e IndexedDB conservan datos entre recargas *en el mismo navegador*, pero no es una cola de sincronización a un backend; no hay envío real a cocina desde otros dispositivos.
2. Se pueden habilitar avisos locales de cambio de estado desde Perfil (Notification API, permiso del usuario). Las notificaciones push remotas requieren un servicio de envío y suscripción. El SW contiene un manejador de evento `push` listo para integración futura, pero **no hay servidor de notificaciones ni suscripción activa**.
3. Si el dispositivo no visitó FastOrder conectado y no precargó la app, la primera visita offline no podrá funcionar.
4. El navegador de desarrollo `ng serve` no prueba PWA: construye con `npm run build`, publica `dist/fastorder-pwa/browser/` en un servidor HTTPS y verifica Application > Manifest / Service Workers / Cache Storage.

## Pruebas básicas
- `npm install`
- `npm run build`
- Servir la carpeta de producción por HTTPS.
- Abrir el sitio conectado y navegar por catálogo y productos; desactivar la red en DevTools y recargar.
- Verificar imágenes en Network, Cache Storage, instalación de la app, persistencia de carrito/pedidos y aviso offline.
- Validar el flujo de cocina en el mismo navegador/origen. No afirmar sincronización remota.
