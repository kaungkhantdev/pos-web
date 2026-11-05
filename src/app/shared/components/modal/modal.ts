import { Component, input, model, output } from '@angular/core';

const WIDTHS = { xs: 'max-w-xs', sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' } as const;

@Component({
  imports: [],
  selector: 'app-modal',
  host: { '(document:keydown.escape)': 'onEscape()' },
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class Modal {
  open = model(false);
  title = input('');
  subtitle = input('');
  icon = input('');
  size = input<keyof typeof WIDTHS>('md');
  /** fires when closed by backdrop, ✕ or Escape */
  closed = output<void>();

  widths = WIDTHS;

  close() {
    this.open.set(false);
    this.closed.emit();
  }

  onEscape() {
    if (this.open()) this.close();
  }
}
