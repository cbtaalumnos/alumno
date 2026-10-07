/* ============================================================================
   CBTA No. 291 · Service worker del portal del alumno

   Solo recibe notificaciones. A propósito NO guarda páginas en caché: así,
   cuando se sube una versión nueva del portal, los alumnos la ven de
   inmediato y nunca se quedan con una copia vieja.
   ========================================================================== */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Llega una notificación del servidor
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (_) { d = { cuerpo: e.data ? e.data.text() : '' }; }

  e.waitUntil(self.registration.showNotification(d.titulo || 'CBTA No. 291', {
    body: d.cuerpo || '',
    icon: 'icono-192.png',
    badge: 'insignia-96.png',
    tag: d.etiqueta || undefined,
    lang: 'es-MX',
    data: { url: d.url || './' }
  }));
});

// El alumno toca la notificación: se abre el portal en la sección que toca
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = new URL((e.notification.data && e.notification.data.url) || './',
                          self.registration.scope).href;

  e.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const v of ventanas) {
      if (v.url.startsWith(self.registration.scope) && !v.url.includes('admin.html')) {
        await v.focus();
        if ('navigate' in v) return v.navigate(destino);
        return;
      }
    }
    return self.clients.openWindow(destino);
  })());
});
