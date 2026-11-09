import { Service } from '@angular/core';

const KEY = 'pos.refreshToken';

@Service()
export class TokenStorageService {

  get(): string | null {
    return read(localStorage) ?? read(sessionStorage);
  }

  remembered(): boolean {
    return read(localStorage) !== null;
  }

  set(token: string, remember: boolean): void {
    this.clear();
    try {
      (remember ? localStorage : sessionStorage).setItem(KEY, token);
    } catch {
      /* private mode / storage blocked: session lasts until reload */
    }
  }

  clear(): void {
    for (const s of [localStorage, sessionStorage]) {
      try {
        s.removeItem(KEY);
      } catch {
        /* ignore */
      }
    }
  }
}


function read(s: Storage): string | null {
  try {
    return s.getItem(KEY);
  } catch {
    return null;
  }
}
