import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/notify/toast.service';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { Modal } from '../../../../shared/components/modal/modal';
import { ConfirmService } from '../../../../core/notify/confirm.service';
import { CURRENT_USER_ID, PERMISSIONS, ROLE_DEFAULTS, ROLES, USERS } from '../../data/users.mock';
import { Permission, Role, StaffUser } from '../../data/user.modal';
import { generatePassword, PASSWORD_RULES } from '../../password';


const PAGE_SIZE = 10;
const TONES = [
  'bg-[#00c066]/10 text-[#00994f]',
  'bg-blue-50 text-blue-500',
  'bg-amber-50 text-amber-500',
  'bg-purple-50 text-purple-500',
];

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, HeaderTools, Modal],
  templateUrl: './users.html',
  host: { class: 'block' },
})
export class Users {
  private fb = inject(FormBuilder).nonNullable;
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  roles = ROLES;
  permissionOptions = PERMISSIONS;
  meId = CURRENT_USER_ID;
  roleInfo = Object.fromEntries(ROLES.map((r) => [r.value, r])) as Record<
    Role,
    (typeof ROLES)[number]
  >;

  users = signal<StaffUser[]>(USERS);
  activeAdmins = computed(() => this.users().filter((u) => u.role === 'admin' && u.active).length);

  // ---------- Search, filter, paging ----------
  search = signal('');
  roleFilter = signal<Role | ''>('');
  page = signal(1);

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const r = this.roleFilter();
    return this.users().filter(
      (u) =>
        (!r || u.role === r) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    );
  });
  pageCount = computed(() => Math.max(Math.ceil(this.filtered().length / PAGE_SIZE), 1));
  rows = computed(() => {
    const start = (Math.min(this.page(), this.pageCount()) - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });
  pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  onSearch(v: string) {
    this.search.set(v);
    this.page.set(1);
  }
  onRole(v: string) {
    this.roleFilter.set(v as Role | '');
    this.page.set(1);
  }
  goTo(p: number) {
    this.page.set(Math.min(Math.max(p, 1), this.pageCount()));
  }

  initials(u: StaffUser) {
    const p = u.name.trim().split(/\s+/);
    return (
      (p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : (p[0]?.[1] ?? ''))
    ).toUpperCase();
  }
  tone(u: StaffUser) {
    return TONES[(u.id - 1) % TONES.length];
  }

  /** the only active admin can't lose admin rights or be removed */
  isLastAdmin(u: StaffUser) {
    return u.role === 'admin' && u.active && this.activeAdmins() === 1;
  }

  // ---------- Create / edit ----------
  formOpen = signal(false);
  editing = signal<StaffUser | null>(null);
  showPassword = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    role: this.fb.control<Role>('cashier'),
    permissions: this.fb.control<Permission[]>(ROLE_DEFAULTS.cashier),
    active: [true],
    password: ['', PASSWORD_RULES],
  });

  constructor() {
    // picking a role fills in its default permissions
    this.form.controls.role.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((role) => this.form.controls.permissions.setValue([...ROLE_DEFAULTS[role]]));
  }

  invalid(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  hasPerm(p: Permission) {
    return this.form.controls.permissions.value.includes(p);
  }

  togglePerm(p: Permission) {
    const c = this.form.controls.permissions;
    c.setValue(c.value.includes(p) ? c.value.filter((x) => x !== p) : [...c.value, p]);
  }

  openCreate() {
    this.editing.set(null);
    // emitEvent: false so the role listener doesn't overwrite these values
    this.form.reset(
      {
        name: '',
        email: '',
        role: 'cashier',
        permissions: [...ROLE_DEFAULTS.cashier],
        active: true,
        password: '',
      },
      { emitEvent: false },
    );
    this.form.controls.password.enable({ emitEvent: false });
    this.showPassword.set(false);
    this.formOpen.set(true);
  }

  openEdit(u: StaffUser) {
    this.editing.set(u);
    this.form.reset(
      {
        name: u.name,
        email: u.email,
        role: u.role,
        permissions: [...u.permissions],
        active: u.active,
        password: '',
      },
      { emitEvent: false },
    );
    this.form.controls.password.disable({ emitEvent: false }); // passwords change through "Reset password"
    this.formOpen.set(true);
  }

  fillPassword() {
    this.form.controls.password.setValue(generatePassword());
    this.form.controls.password.markAsTouched();
    this.showPassword.set(true);
  }

  async copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.info('Copied', 'The password is on your clipboard.');
    } catch {
      this.toast.error('Could not copy', 'Select the password and copy it by hand.');
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value = {
      name: raw.name.trim(),
      email: raw.email.trim().toLowerCase(),
      role: raw.role,
      permissions: raw.role === 'admin' ? [...ROLE_DEFAULTS.admin] : raw.permissions,
      active: raw.active,
    };
    const current = this.editing();

    if (this.users().some((u) => u.email === value.email && u.id !== current?.id)) {
      this.form.controls.email.setErrors({ duplicate: true });
      return;
    }
    if (current) {
      if (current.id === this.meId && !value.active) {
        this.toast.error('Not allowed', 'You cannot deactivate your own account.');
        return;
      }
      if (this.isLastAdmin(current) && (value.role !== 'admin' || !value.active)) {
        this.toast.error(
          'Keep one admin',
          'At least one active admin is needed to manage the system.',
        );
        return;
      }
      // TODO: PUT /api/users/{id}
      this.users.update((list) => list.map((u) => (u.id === current.id ? { ...u, ...value } : u)));
      this.toast.success('Changes saved', 'The staff account has been updated.');
    } else {
      // TODO: POST /api/users { ...value, password: raw.password } (server should force a change on first sign-in)
      const id = Math.max(0, ...this.users().map((u) => u.id)) + 1;
      this.users.update((list) => [{ id, ...value }, ...list]);
      this.page.set(1);
      this.toast.success('User created', 'The new staff account is ready.');
    }
    this.formOpen.set(false);
  }

  // ---------- Reset password ----------
  resetOpen = signal(false);
  resetting = signal<StaffUser | null>(null);
  showReset = signal(false);
  resetForm = this.fb.group({ password: ['', PASSWORD_RULES] });

  openReset(u: StaffUser) {
    this.resetting.set(u);
    this.resetForm.reset({ password: '' });
    this.showReset.set(false);
    this.resetOpen.set(true);
  }

  fillReset() {
    this.resetForm.controls.password.setValue(generatePassword());
    this.resetForm.controls.password.markAsTouched();
    this.showReset.set(true);
  }

  saveReset() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    // TODO: POST /api/users/{id}/reset-password
    this.resetOpen.set(false);
    this.toast.info('Password reset', `A new password has been set for ${this.resetting()?.name}.`);
  }

  // ---------- Delete ----------
  async remove(u: StaffUser) {
    if (u.id === this.meId) return;
    if (this.isLastAdmin(u)) {
      this.toast.error('Keep one admin', 'Add another admin before deleting this one.');
      return;
    }
    const ok = await this.confirm.ask({
      title: 'Delete staff?',
      message: `Are you sure you want to delete ${u.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Dismiss',
      confirmIcon: 'hgi-delete-02',
    });
    if (!ok) return;
    // TODO: DELETE /api/users/{id}
    this.users.update((list) => list.filter((x) => x.id !== u.id));
    this.toast.success('Staff deleted', `${u.name} no longer has access.`);
  }
}
