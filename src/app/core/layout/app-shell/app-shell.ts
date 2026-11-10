import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
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
import { AuthService } from '../../auth/auth.service';

const SIDEBAR_KEY = 'astronity.sidebar';

function readExpanded(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'expanded';
  } catch {
    return false;
  }
}

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
  private auth = inject(AuthService);

  nav = MAIN_NAV;
  bottomNav = BOTTOM_NAV;
  menuOpen = signal(false);

  /** Desktop: sidebar shows names. Remembered between visits. */
  expanded = signal(readExpanded());
  toggleLabel = computed(() => (this.expanded() ? 'Collapse menu' : 'Expand menu'));

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
    if (open) this.rail().nativeElement.querySelector<HTMLElement>('nav .sb-item')?.focus();
  }

  toggleExpanded() {
    const on = !this.expanded();
    this.expanded.set(on);
    try {
      localStorage.setItem(SIDEBAR_KEY, on ? 'expanded' : 'collapsed');
    } catch {
      // storage blocked (private mode): the choice just isn't remembered
    }
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
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }

  private readFullHeight(): boolean {
    let r = this.route.snapshot;
    while (r.firstChild) r = r.firstChild;
    return r.data['fullHeight'] === true;
  }
}
