import { Howl } from 'howler';

const cache = new Map<string, Howl>();

function play(name: string, src: string, volume = 0.4) {
  let howl = cache.get(name);
  if (!howl) {
    howl = new Howl({ src: [src], volume, preload: true });
    cache.set(name, howl);
  }
  howl.play();
}

export const sounds = {
  messageIn: () =>
    play(
      'in',
      'https://cdn.jsdelivr.net/gh/akx/Notifications@master/notifications/pop.mp3',
      0.35,
    ),
  messageOut: () =>
    play(
      'out',
      'https://cdn.jsdelivr.net/gh/akx/Notifications@master/notifications/blip.mp3',
      0.25,
    ),
  emojiBlast: () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.07;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.28, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.start(start);
        osc.stop(start + 0.38);
      });
    } catch {}
  },
};
