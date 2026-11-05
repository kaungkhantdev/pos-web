import { signal, Service } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message?: string;
  timeout?: number; // ms, 0 = stays until closed. Default 5000
}

export interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message?: string;
  leaving: boolean;
}

@Service()
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private nextId = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();
  private timeouts = new Map<number, number>();

  show(o: ToastOptions) {
    const id = ++this.nextId;
    const toast: Toast = {
      id,
      type: o.type ?? 'success',
      title: o.title,
      message: o.message,
      leaving: false,
    };
    this.toasts.update((list) => [toast, ...list]); // newest on top
    this.timeouts.set(id, o.timeout ?? 5000);
    this.resume(id);
    return { close: () => this.close(id) };
  }

  success(title: string, message?: string) {
    return this.show({ type: 'success', title, message });
  }
  error(title: string, message?: string) {
    return this.show({ type: 'error', title, message });
  }
  warning(title: string, message?: string) {
    return this.show({ type: 'warning', title, message });
  }
  info(title: string, message?: string) {
    return this.show({ type: 'info', title, message });
  }

  close(id: number) {
    const toast = this.toasts().find((t) => t.id === id);
    if (!toast || toast.leaving) return;
    this.pause(id);
    this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    // matches the 0.2s .app-toast-out transition
    setTimeout(() => {
      this.toasts.update((list) => list.filter((t) => t.id !== id));
      this.timeouts.delete(id);
    }, 200);
  }

  /** hover stops the timer */
  pause(id: number) {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }

  /** mouse leaves → full timeout again, like the kit */
  resume(id: number) {
    const ms = this.timeouts.get(id) ?? 0;
    if (ms > 0)
      this.timers.set(
        id,
        setTimeout(() => this.close(id), ms),
      );
  }
}
