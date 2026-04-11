/* GeoMhls Push Notification Service Worker */

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'GeoMhls', body: event.data.text() };
  }

  const title = payload.title || 'GeoMhls';
  const options = {
    body: payload.body || 'You have a new message',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.tag || 'geomhls',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
