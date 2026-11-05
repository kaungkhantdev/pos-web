import { Component, inject } from '@angular/core';
import { ToastType, ToastService } from '../toast.service';

const ICONS: Record<ToastType, string> = {
  success: 'hgi-checkmark-circle-02',
  error: 'hgi-alert-02',
  warning: 'hgi-alert-02',
  info: 'hgi-information-circle',
};

@Component({
  imports: [],
  selector: 'app-toasts',
  styleUrl: './toasts.css',
  host: { class: 'app-toast-stack', 'aria-live': 'polite' },
  templateUrl: './toasts.html',
})
export class Toasts {
  toast = inject(ToastService);
  icons = ICONS;
}
