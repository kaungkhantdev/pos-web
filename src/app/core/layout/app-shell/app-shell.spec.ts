import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  let component: AppShell;
  let fixture: ComponentFixture<AppShell>;

  beforeEach(async () => {
    // jsdom has no matchMedia; the shell uses it to close the phone drawer on resize
    window.matchMedia ??= ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;

    // and no localStorage in this test setup; the shell stores the sidebar choice there
    if (!globalThis.localStorage) {
      const data = new Map<string, string>();
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: {
          getItem: (k: string) => data.get(k) ?? null,
          setItem: (k: string, v: string) => void data.set(k, String(v)),
          removeItem: (k: string) => void data.delete(k),
          clear: () => data.clear(),
        },
      });
    }

    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('expands and collapses the sidebar, remembering the choice', () => {
    localStorage.removeItem('astronity.sidebar');
    const rail: HTMLElement = fixture.nativeElement.querySelector('#sidebar');
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.rail-toggle');

    toggle.click();
    fixture.detectChanges();
    expect(rail.classList).toContain('expanded');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse menu');
    expect(localStorage.getItem('astronity.sidebar')).toBe('expanded');

    toggle.click();
    fixture.detectChanges();
    expect(rail.classList).not.toContain('expanded');
    expect(toggle.getAttribute('aria-label')).toBe('Expand menu');
    expect(localStorage.getItem('astronity.sidebar')).toBe('collapsed');
  });
});
