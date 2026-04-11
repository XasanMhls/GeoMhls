import { useCallback, useEffect, useRef, useState } from 'react';

const THRESHOLD = 80;

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startYRef = useRef<number | null>(null);
  const refreshingRef = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (refreshingRef.current) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (refreshingRef.current || startYRef.current === null) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta <= 0) {
      setPullDistance(0);
      return;
    }
    // Apply rubber-band resistance so distance feels natural
    const dampened = Math.min(delta * 0.5, THRESHOLD * 1.5);
    setPullDistance(dampened);
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (refreshingRef.current || startYRef.current === null) return;
    startYRef.current = null;

    if (pullDistance >= THRESHOLD) {
      refreshingRef.current = true;
      setRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        refreshingRef.current = false;
        setRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, refreshing };
}
