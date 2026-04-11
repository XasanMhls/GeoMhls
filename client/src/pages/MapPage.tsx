import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapView } from '@/components/map/MapView';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';

export default function MapPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const groups = useGroupsStore((s) => s.groups);
  const fetchGroups = useGroupsStore((s) => s.fetchGroups);
  const shareLocation = user?.settings?.shareLocation ?? true;
  const freezeLocation = user?.settings?.freezeLocation ?? false;

  // Always watch GPS locally (for map centering), share controls socket emit
  const { position } = useGeolocation(shareLocation, freezeLocation);
  const [center, setCenter] = useState<[number, number] | undefined>();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (position && !center) setCenter([position.lng, position.lat]);
  }, [position, center]);

  const markers = useMemo(() => {
    const seen = new Map<string, any>();
    for (const g of groups) {
      for (const m of g.members as any[]) {
        const u = m.user;
        if (!u?.location?.lat || !u?.location?.lng) continue;
        if (seen.has(u._id)) continue;
        seen.set(u._id, {
          id: u._id,
          lat: u.location.lat,
          lng: u.location.lng,
          name: u.name,
          avatar: u.avatar,
          color: g.color,
          isSelf: u._id === user?.id,
          isOnline: u.isOnline ?? false,
        });
      }
    }
    // Always show self marker if we have a GPS position
    if (position && user) {
      seen.set(user.id, {
        id: user.id,
        lat: position.lat,
        lng: position.lng,
        name: user.name,
        avatar: user.avatar,
        color: '#6366f1',
        isSelf: true,
        isOnline: true,
        isFrozen: freezeLocation,
        // Self marker always visible regardless of shareLocation
      });
    }
    return Array.from(seen.values());
  }, [groups, position, user, freezeLocation]);

  const focus = () => {
    if (position) setCenter([position.lng, position.lat]);
  };

  const locationStatus = () => {
    if (freezeLocation) return '❄️ ' + (t('profile.freezeLocation'));
    if (!shareLocation) return t('map.shareDisabled');
    return t('map.you');
  };

  return (
    <div className="relative h-[100dvh]">
      <MapView center={center} markers={markers} />

      <div className="absolute inset-x-0 top-0 safe-top p-4 pointer-events-none">
        <GlassCard className="pointer-events-auto flex items-center gap-3 px-4 py-3">
          <Avatar src={user?.avatar} name={user?.name} size={40} online />
          <div className="flex-1 min-w-0">
            <div className="truncate text-[15px] font-semibold">{user?.name}</div>
            <div className="text-xs text-text-muted">{locationStatus()}</div>
          </div>
          {freezeLocation && (
            <div className="flex-shrink-0 rounded-lg bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-400">
              ❄️
            </div>
          )}
          {!shareLocation && !freezeLocation && (
            <div className="flex-shrink-0 rounded-lg bg-orange-500/20 px-2 py-1 text-xs font-semibold text-orange-400">
              {t('map.enableShare')}
            </div>
          )}
        </GlassCard>
      </div>

      <button
        onClick={focus}
        className="glass-strong absolute bottom-28 right-5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl active:scale-95 transition"
        aria-label={t('map.centerOnMe')}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      </button>
    </div>
  );
}
