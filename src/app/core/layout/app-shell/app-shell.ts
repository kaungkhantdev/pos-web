import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { Logo } from '../../../shared/components/logo/logo';
import { ConfirmService } from '../../notify/confirm.service';
import { BOTTOM_NAV, MAIN_NAV } from './nav';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, Logo],
  templateUrl: './app-shell.html',
  host: {
    class: 'app-shell', // was <body class="app-shell">
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class AppShell {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirm = inject(ConfirmService);

  nav = MAIN_NAV;
  bottomNav = BOTTOM_NAV;
  menuOpen = signal(false);

  private rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  private toggleBtn = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');

  private navEnd$ = this.router.events.pipe(filter((e) => e instanceof NavigationEnd));

  /** POS and Kitchen set data: { fullHeight: true } on their route */
  fullHeight = toSignal(this.navEnd$.pipe(map(() => this.readFullHeight())), {
    initialValue: this.readFullHeight(),
  });

  constructor() {
    // Close the drawer after picking a page
    this.navEnd$.pipe(takeUntilDestroyed()).subscribe(() => this.menuOpen.set(false));

    // Close the drawer when the screen grows to tablet/desktop
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => e.matches && this.menuOpen.set(false);
    mq.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => mq.removeEventListener('change', onChange));
  }

  setMenu(open: boolean) {
    this.menuOpen.set(open);
    if (open) this.rail().nativeElement.querySelector<HTMLElement>('.sb-item')?.focus();
  }

  onEscape() {
    if (!this.menuOpen()) return;
    this.setMenu(false);
    this.toggleBtn().nativeElement.focus();
  }

  async logout() {
    const ok = await this.confirm.ask({
      tone: 'warning',
      title: 'Log out?',
      message: 'You will need to sign in again to use the POS.',
      confirmText: 'Log out',
    });
    if (!ok) return;
    // TODO: AuthService.logout()
    this.router.navigateByUrl('/auth/login');
  }

  private readFullHeight(): boolean {
    let r = this.route.snapshot;
    while (r.firstChild) r = r.firstChild;
    return r.data['fullHeight'] === true;
  }
}
