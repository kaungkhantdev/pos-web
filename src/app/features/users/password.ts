import { Validators } from '@angular/forms';

/** at least 8 characters with a letter and a number */
export const PASSWORD_RULES = [
  Validators.required,
  Validators.minLength(8),
  Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
];

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // no 0/O/1/l/I

/** random 10-char password that always has a letter and a number */
export function generatePassword(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  const pwd = Array.from(bytes, (b) => CHARS[b % CHARS.length]).join('');
  return /\d/.test(pwd) && /[A-Za-z]/.test(pwd) ? pwd : generatePassword(length);
}
