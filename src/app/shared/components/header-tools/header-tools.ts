import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-header-tools',
  host: { class: 'header-tools' },
  styleUrl: './header-tools.css',
  templateUrl: './header-tools.html',
})
export class HeaderTools {
  hasUnread = signal(true);
}
