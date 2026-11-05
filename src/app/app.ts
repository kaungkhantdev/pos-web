import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toasts } from './core/notify/toasts/toasts';
import { ConfirmBox } from './core/notify/confirm-box/confirm-box';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toasts, ConfirmBox],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('pos-web');
}
