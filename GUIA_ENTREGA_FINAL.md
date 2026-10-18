# FastOrder — Entrega técnica del Trabajo Final PWA

## Alcance y tecnologías

- Angular 19, interfaz responsive y carta con imágenes empaquetadas.
- Web App Manifest e iconos instalables.
- Service Worker con precaché de interfaz, cache-first para archivos y network-first para menú dinámico.
- Persistencia local `localStorage` + IndexedDB; pedidos pendientes si la red falla.
- API HTTP Node.js sin base de datos relacional: `server/data/orders.json` es un **archivo de demostración persistente**.
- Actualización a cocina por Server-Sent Events (SSE); envío inicial por REST.
- Notificaciones locales y Web Push real *si se configuran las claves VAPID y permisos*.

## Desarrollo local (dos terminales)

1. `npm install`
2. Terminal A: `npm run server` (API en `http://localhost:8080`).
3. Terminal B: `npm start` (frontend en `http://localhost:4200`; proxy `/api` hacia el servidor).
4. Navega en el cliente y en cocina usando **dos navegadores/dispositivos diferentes** conectados al mismo origen; en desarrollo, para otro dispositivo se necesita exponer Angular de modo seguro en red.

## Producción / pruebas reales de PWA

1. `npm run build`
2. `npm run serve:production`
3. Visita `http://localhost:8080` y prueba la instalación de la PWA. En hosting público es obligatorio usar **HTTPS**.
4. Abre `DevTools → Application → Service Workers` y comprueba que `sw.js` está activo.
5. Abre **Network → Offline** una vez que hayas visitado menú y pedidos; recarga y valida los recursos almacenados.
6. Confirma una orden sin conexión: debe mostrar **Pendiente de envío**. Restaura la conexión, comprueba su envío y aparición en el panel de cocina.
7. En cocina, cambia estado. En el cliente debe actualizarse al recuperar la conexión o mediante SSE.

## Notificaciones Web Push

1. Genera claves: `npx web-push generate-vapid-keys`.
2. Exporta `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_EMAIL` en el servidor antes de iniciarlo.
3. Activa notificaciones en `Perfil` desde un origen seguro (`localhost` o HTTPS).
4. Cambia un pedido en cocina y observa la notificación, incluso con la pestaña cliente cerrada, donde el navegador/OS lo admita.
5. Si no se configuran claves, las notificaciones disponibles son **locales**; no se debe presentar esto como Web Push real.

## Pruebas sugeridas con evidencia

| Caso | Procedimiento | Esperado |
|---|---|---|
| PWA instalable | Application → Manifest / Instalar | Icono, nombre, ventana standalone |
| Shell offline | Visitar online → DevTools Offline → Recargar | Vista ya visitada operativa |
| Menú estático | DevTools → Cache Storage | Imágenes y JSON presentes |
| Pedido online | Cliente confirmar → Cocina observar | Pedido recibido sin recargar |
| Pedido offline | DevTools Offline → confirmar | Queda pendiente localmente |
| Sincronización | Recuperar conexión → revisar cocina | Se recibe una sola vez por ID |
| Estado remoto | Cocina cambia estado → Cliente observa | Estado actualizado en ambos |
| Push | Activar permisos y VAPID | Aviso real del navegador |
| Responsive | DevTools dispositivos 390px, 768px, escritorio | Sin desbordes horizontales |
| Navegadores | Chrome, Edge, Firefox, Safari | Registrar resultado real por navegador |

## Limitaciones y seguridad

- El archivo JSON no sustituye una BD transaccional para producción; sirve para la demostración académica sin instalar una base de datos.
- Para proteger cambios de cocina, configura `KITCHEN_PIN` como variable del servidor y escríbelo en el panel de cocina. No uses la clave de ejemplo.
- **El endpoint de consulta de pedidos y el panel de cocina no incorporan autenticación por usuario**; NO publiquen datos personales ni desplieguen el proyecto en Internet abierto como sistema comercial. Para una entrega pública, aplicar autenticación, roles, protección de lectura y control de abuso.
- El uso de `navigator.onLine` es aproximado: el envío se confirma únicamente si la API responde.
- Background Sync depende del navegador; también hay reintento al recuperar foco o conexión, de modo que el usuario no queda bloqueado en navegadores sin Background Sync.
- Los requisitos de sincronización remota y Web Push dependen de ejecutar el servidor Node; el frontend por sí solo conserva pedidos localmente pero no puede entregarlos a otra terminal.
- No se realizó prueba de extremo a extremo en todos los sistemas/navegadores; registrar las capturas únicamente tras ejecutar los casos indicados.
