import { signal, Service } from '@angular/core';

export type ConfirmTone = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  tone?: ConfirmTone; // default 'danger'
  title?: string; // default 'Are you sure?'
  message?: string;
  confirmText?: string; // default 'Confirm'
  cancelText?: string; // default 'Dismiss'
  icon?: string; // header icon, overrides the tone's icon
  confirmIcon?: string; // icon inside the confirm button
}

export interface ConfirmRequest extends ConfirmOptions {
  tone: ConfirmTone;
  resolve: (ok: boolean) => void;
}

@Service()
export class ConfirmService {
  readonly current = signal<ConfirmRequest | null>(null);

  ask(o: ConfirmOptions = {}): Promise<boolean> {
    this.current()?.resolve(false); // only one box at a time
    return new Promise((resolve) => this.current.set({ tone: 'danger', ...o, resolve }));
  }

  done(ok: boolean) {
    const c = this.current();
    if (!c) return;
    this.current.set(null);
    c.resolve(ok);
  }
}
