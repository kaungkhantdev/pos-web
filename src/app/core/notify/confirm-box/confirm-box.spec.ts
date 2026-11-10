import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmService } from '../confirm.service';
import { ConfirmBox } from './confirm-box';

describe('ConfirmBox', () => {
  let component: ConfirmBox;
  let fixture: ComponentFixture<ConfirmBox>;
  let confirm: ConfirmService;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmBox],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmBox);
    component = fixture.componentInstance;
    confirm = TestBed.inject(ConfirmService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows nothing until asked', () => {
    expect(el().querySelector('.cf-box')).toBeNull();
  });

  it('shows the title, message and buttons, and resolves true on confirm', async () => {
    const answer = confirm.ask({
      title: 'Delete item?',
      message: 'This cannot be undone.',
      confirmText: 'Delete',
      confirmIcon: 'hgi-delete-02',
    });
    await fixture.whenStable();

    expect(el().querySelector('.cf-title')?.textContent).toContain('Delete item?');
    expect(el().querySelector('.cf-msg')?.textContent).toContain('This cannot be undone.');
    expect(el().querySelector('.cf-head')?.classList).toContain('cf-danger');
    const ok = el().querySelector<HTMLButtonElement>('.cf-btn-danger')!;
    expect(ok.textContent).toContain('Delete');
    expect(ok.querySelector('.hgi-delete-02')).not.toBeNull();

    ok.click();
    expect(await answer).toBe(true);
    await fixture.whenStable();
    expect(el().querySelector('.cf-box')).toBeNull();
  });

  it('uses the tone for the header and button colour', async () => {
    confirm.ask({ tone: 'warning', title: 'Log out?', confirmText: 'Log out' });
    await fixture.whenStable();
    expect(el().querySelector('.cf-head')?.classList).toContain('cf-warning');
    expect(el().querySelector('.cf-btn-warning')?.textContent).toContain('Log out');
  });

  it('resolves false on Dismiss', async () => {
    const answer = confirm.ask({ title: 'Clear this order?' });
    await fixture.whenStable();
    el().querySelector<HTMLButtonElement>('.cf-btn-soft')!.click();
    expect(await answer).toBe(false);
  });

  it('resolves false on Escape', async () => {
    const answer = confirm.ask({ title: 'Clear this order?' });
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(await answer).toBe(false);
  });
});
