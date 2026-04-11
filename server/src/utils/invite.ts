import { LIMITS } from '@geomhls/shared';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < LIMITS.INVITE_CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
