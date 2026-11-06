import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { Modal } from '../../../../shared/components/modal/modal';
import { ToastService } from '../../../../core/notify/toast.service';
import { ConfirmService } from '../../../../core/notify/confirm.service';
import { Category } from '../../data/category.modal';
import { CATEGORIES } from '../../data/categories.mock';

type StatusFilter = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 10;
const TONES = [
  'bg-[#00c066]/10 text-[#00994f]',
  'bg-blue-50 text-blue-500',
  'bg-amber-50 text-amber-500',
  'bg-purple-50 text-purple-500',
  'bg-green-50 text-green-600',
];

@Component({
  selector: 'app-categories',
  imports: [ReactiveFormsModule, DatePipe, HeaderTools, Modal],
  templateUrl: './categories.html',
  host: { class: 'block' },
})
export class Categories {
  private fb = inject(FormBuilder).nonNullable;
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  categories = signal<Category[]>(CATEGORIES);

  // ---------- Search, filter, paging ----------
  search = signal('');
  status = signal<StatusFilter>('all');
  filterOpen = signal(false);
  page = signal(1);
  statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const s = this.status();
    return this.categories().filter(
      (c) =>
        (s === 'all' || c.active === (s === 'active')) &&
        (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)),
    );
  });
  pageCount = computed(() => Math.max(Math.ceil(this.filtered().length / PAGE_SIZE), 1));
  rows = computed(() => {
    const start = (Math.min(this.page(), this.pageCount()) - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });
  pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  setStatus(value: StatusFilter) {
    this.status.set(value);
    this.filterOpen.set(false);
    this.page.set(1);
  }

  goTo(p: number) {
    this.page.set(Math.min(Math.max(p, 1), this.pageCount()));
  }

  // ---------- Avatar ----------
  /** "M", or "De" when an earlier category already uses "D" (same as the kit) */
  initials = computed(() => {
    const used = new Set<string>();
    const map = new Map<number, string>();
    for (const c of this.categories()) {
      const one = c.name.charAt(0).toUpperCase();
      const label = used.has(one) ? one + c.name.charAt(1).toLowerCase() : one;
      used.add(one);
      map.set(c.id, label);
    }
    return map;
  });

  tone(c: Category) {
    return TONES[(c.id - 1) % TONES.length];
  }

  // ---------- Create / edit ----------
  formOpen = signal(false);
  editing = signal<Category | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', Validators.maxLength(200)],
    active: [true],
  });

  openCreate() {
    this.editing.set(null);
    this.form.reset({ name: '', description: '', active: true });
    this.formOpen.set(true);
  }

  openEdit(c: Category) {
    this.editing.set(c);
    this.form.reset({ name: c.name, description: c.description, active: c.active });
    this.formOpen.set(true);
  }

  isDuplicate(name: string) {
    const n = name.trim().toLowerCase();
    return this.categories().some((c) => c.name.toLowerCase() === n && c.id !== this.editing()?.id);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = { ...this.form.getRawValue(), name: this.form.controls.name.value.trim() };
    if (this.isDuplicate(value.name)) {
      this.form.controls.name.setErrors({ duplicate: true });
      return;
    }

    this.saving.set(true);
    const current = this.editing();
    if (current) {
      // TODO: PUT /api/categories/{id}
      this.categories.update((list) =>
        list.map((c) => (c.id === current.id ? { ...c, ...value } : c)),
      );
      this.toast.success('Changes saved', 'The category has been updated.');
    } else {
      // TODO: POST /api/categories (use the returned id + createdAt)
      const id = Math.max(0, ...this.categories().map((c) => c.id)) + 1;
      const created: Category = { id, ...value, itemCount: 0, createdAt: new Date().toISOString() };
      this.categories.update((list) => [created, ...list]);
      this.page.set(1);
      this.toast.success('Category created', 'The new category is ready to use.');
    }
    this.saving.set(false);
    this.formOpen.set(false);
  }

  // ---------- Delete ----------
  async remove(c: Category) {
    const ok = await this.confirm.ask({
      title: 'Delete category?',
      message: `Are you sure you want to delete ${c.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Dismiss',
      confirmIcon: 'hgi-delete-02',
    });
    if (!ok) return;
    // TODO: DELETE /api/categories/{id}
    this.categories.update((list) => list.filter((x) => x.id !== c.id));
    this.toast.success('Category deleted', `${c.name} has been removed.`);
  }
}
