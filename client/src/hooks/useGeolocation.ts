import { useEffect, useRef, useState } from 'react';
import { LIMITS, SOCKET_EVENTS } from '@geomhls/shared';
import { getSocket } from '@/lib/socket';

export interface Position {
  lat: number;
  lng: number;
  accuracy: number;
}

/**
 * @param share   Whether to broadcast position to socket (controlled by user setting)
 * @param frozen  When true, GPS is watched locally but never emitted
 */
export function useGeolocation(share: boolean, frozen = false) {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastSent = useRef<number>(0);
  const shareRef = useRef(share);
  const frozenRef = useRef(frozen);

  useEffect(() => { shareRef.current = share; }, [share]);
  useEffect(() => { frozenRef.current = frozen; }, [frozen]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    // Always watch GPS locally (so the map can center on the user)
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next: Position = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setPosition(next);
        setError(null);

        // Only broadcast if sharing is on and not frozen
        if (!shareRef.current || frozenRef.current) return;

        const now = Date.now();
        if (now - lastSent.current >= LIMITS.LOCATION_INTERVAL_MS) {
          lastSent.current = now;
          getSocket()?.emit(SOCKET_EVENTS.LOCATION_UPDATE, next);
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []); // run once — share/frozen controlled via refs

  return { position, error };
}
