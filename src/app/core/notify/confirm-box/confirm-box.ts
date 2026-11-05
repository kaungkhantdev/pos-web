import { Component, DestroyRef, effect, ElementRef, inject, viewChild } from '@angular/core';
import { ConfirmService, ConfirmTone } from '../confirm.service';

const TONES: Record<ConfirmTone, { icon: string; btn: string }> = {
  danger: { icon: 'hgi-alert-02', btn: 'cf-btn-danger' },
  warning: { icon: 'hgi-alert-02', btn: 'cf-btn-warning' },
  info: { icon: 'hgi-information-circle', btn: 'cf-btn-primary' },
  success: { icon: 'hgi-checkmark-circle-02', btn: 'cf-btn-primary' },
};

@Component({
  imports: [],
  selector: 'app-confirm-box',
  styleUrl: './confirm-box.css',
  templateUrl: './confirm-box.html',
})
export class ConfirmBox {
  confirm = inject(ConfirmService);
  tones = TONES;

  private okBtn = viewChild<ElementRef<HTMLButtonElement>>('ok');
  private box = viewChild<ElementRef<HTMLElement>>('box');
  private prevFocus: HTMLElement | null = null;

  constructor() {
    // Focus the confirm button on open, give focus back on close
    effect(() => {
      const btn = this.okBtn();
      if (btn) {
        this.prevFocus = document.activeElement as HTMLElement | null;
        btn.nativeElement.focus();
      } else {
        this.prevFocus?.focus();
        this.prevFocus = null;
      }
    });

    // Capture phase: Escape closes only the box, not the sidebar or a page modal behind it
    const onKey = (e: KeyboardEvent) => {
      if (!this.confirm.current()) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.confirm.done(false);
      } else if (e.key === 'Tab') {
        const buttons = this.box()?.nativeElement.querySelectorAll('button');
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('keydown', onKey, true));
  }
}


// Usage of confirm and toast

// private toast = inject(ToastService);
// private confirm = inject(ConfirmService);
//
// // <button data-toast="success" data-toast-title="Sent to kitchen" ...>
// sendToKitchen() {
//   // TODO: call API, then:
//   this.toast.success('Sent to kitchen', 'The order is now in the kitchen queue.');
// }
//
// // POS "Clear": data-confirm + data-toast
// async clearOrder() {
//   const ok = await this.confirm.ask({
//     title: 'Clear this order?',
//     message: 'All items in the current order will be removed.',
//     confirmText: 'Clear order',
//     confirmIcon: 'hgi-delete-02',
//   });
//   if (!ok) return;
//   // clear cart...
//   this.toast.info('Order cleared', 'Start a new order when you are ready.');
// }
//
// // Delete form with "{name} has been removed": just interpolate
// deleted(item: { name: string }) {
//   this.toast.success('Item deleted', `${item.name} has been removed from the menu.`);
// }
//
// // API errors
// this.toast.error('Could not save', 'Check your connection and try again.');
