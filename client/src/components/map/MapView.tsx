import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useThemeStore } from '@/stores/themeStore';

// Free CARTO styles — no token required
const STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const STYLE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  name: string;
  avatar?: string | null;
  color?: string;
  isSelf?: boolean;
  isOnline?: boolean;
  isFrozen?: boolean;
}

interface Props {
  center?: [number, number];
  markers: MarkerData[];
  onReady?: (map: maplibregl.Map) => void;
}

export function MapView({ center, markers, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const theme = useThemeStore((s) => s.theme);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: theme === 'dark' ? STYLE_DARK : STYLE_LIGHT,
      center: center || [69.2401, 41.2995], // Tashkent default
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    mapRef.current = map;
    map.on('load', () => onReady?.(map));

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch style on theme change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(theme === 'dark' ? STYLE_DARK : STYLE_LIGHT);
  }, [theme]);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set<string>();

    for (const m of markers) {
      seen.add(m.id);
      const existing = markersRef.current.get(m.id);
      if (existing) {
        existing.setLngLat([m.lng, m.lat]);
        // Update opacity for online/offline
        const el = existing.getElement();
        el.style.opacity = m.isOnline === false ? '0.5' : '1';
        continue;
      }

      const el = document.createElement('div');
      el.style.cssText = `
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: ${m.color || '#6366f1'};
        border: 3px solid white;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 14px;
        overflow: hidden;
        cursor: pointer;
        transition: opacity 0.3s;
        opacity: ${m.isOnline === false ? '0.5' : '1'};
        position: relative;
      `;

      if (m.avatar) {
        el.innerHTML = `<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
      } else {
        el.textContent = m.name.slice(0, 2).toUpperCase();
      }

      // Frozen badge
      if (m.isFrozen) {
        const badge = document.createElement('div');
        badge.style.cssText = `
          position: absolute;
          bottom: -2px; right: -2px;
          width: 16px; height: 16px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          font-size: 9px;
          display: flex; align-items: center; justify-content: center;
        `;
        badge.textContent = '❄';
        el.appendChild(badge);
      }

      // Offline indicator
      if (m.isOnline === false) {
        const dot = document.createElement('div');
        dot.style.cssText = `
          position: absolute;
          bottom: -2px; right: -2px;
          width: 12px; height: 12px;
          background: #6b7280;
          border: 2px solid white;
          border-radius: 50%;
        `;
        el.appendChild(dot);
      } else if (!m.isFrozen) {
        // Online green dot
        const dot = document.createElement('div');
        dot.style.cssText = `
          position: absolute;
          bottom: -2px; right: -2px;
          width: 12px; height: 12px;
          background: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
        `;
        el.appendChild(dot);
      }

      const popup = new maplibregl.Popup({ offset: 28, closeButton: false, closeOnClick: false })
        .setText(m.name + (m.isOnline === false ? ' (offline)' : ''));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());

      markersRef.current.set(m.id, marker);
    }

    // Remove markers no longer in list
    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, [markers]);

  // Fly to center
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.flyTo({ center, zoom: 14, duration: 800 });
    }
  }, [center]);

  return <div ref={containerRef} className="h-full w-full" />;
}
