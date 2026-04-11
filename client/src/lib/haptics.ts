const vibrate = (pattern: number | number[]): void => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
};

export const haptics = {
  light(): void {
    vibrate(10);
  },
  medium(): void {
    vibrate(25);
  },
  heavy(): void {
    vibrate(50);
  },
  success(): void {
    vibrate([10, 50, 10]);
  },
  error(): void {
    vibrate([50, 30, 50]);
  },
  selection(): void {
    vibrate(5);
  },
};
