import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

export function usePushNotifications() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (!user.settings?.notifications) return;

    const register = async () => {
      try {
        // Get VAPID public key from server
        const { data } = await api.get('/users/vapid-public-key');
        if (!data.publicKey) return;

        const reg = await navigator.serviceWorker.ready;

        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(data.publicKey),
          });
        }

        // Register subscription with server
        const json = sub.toJSON();
        if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
          await api.post('/users/me/push-subscription', {
            endpoint: json.endpoint,
            keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          });
        }
      } catch {
        // Push subscription failed (e.g. user denied permission) — silently ignore
      }
    };

    // Request permission, then subscribe
    if (Notification.permission === 'granted') {
      register();
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((p) => {
        if (p === 'granted') register();
      });
    }
  }, [user?.id, user?.settings?.notifications]);
}
