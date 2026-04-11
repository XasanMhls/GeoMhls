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
};
