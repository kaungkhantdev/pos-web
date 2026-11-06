import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CATEGORY_OPTIONS,
  MAX_IMAGE_BYTES,
  PRODUCTS,
  STOCK_BADGE,
  stockLevel,
} from '../../data/products.mock';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { Modal } from '../../../../shared/components/modal/modal';
import { BahtPipe } from '../../../../shared/pipes/baht.pipe';
import { ToastService } from '../../../../core/notify/toast.service';
import { ConfirmService } from '../../../../core/notify/confirm.service';
import { Product } from '../../data/product.model';

type StatusFilter = 'all' | 'available' | 'unavailable' | 'low';

const PAGE_SIZE = 10;
const TONES = [
  'bg-[#00c066]/10 text-[#00994f]',
  'bg-blue-50 text-blue-500',
  'bg-amber-50 text-amber-500',
  'bg-purple-50 text-purple-500',
];

@Component({
  selector: 'app-products',
  imports: [ReactiveFormsModule, HeaderTools, Modal, BahtPipe],
  templateUrl: './products.html',
  host: { class: 'block' },
})
export class Products {
  private fb = inject(FormBuilder).nonNullable;
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  categories = CATEGORY_OPTIONS;
  stockBadge = STOCK_BADGE;
  stockLevel = stockLevel;

  products = signal<Product[]>(PRODUCTS);
  categoryName = computed(() => new Map(this.categories.map((c) => [c.id, c.name])));

  // ---------- Search, filters, paging ----------
  search = signal('');
  categoryFilter = signal<number | null>(null);
  status = signal<StatusFilter>('all');
  filterOpen = signal(false);
  page = signal(1);
  statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All items' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Unavailable' },
    { value: 'low', label: 'Low / out of stock' },
  ];

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const cat = this.categoryFilter();
    const s = this.status();
    return this.products().filter(
      (p) =>
        (cat === null || p.categoryId === cat) &&
        (s === 'all' ||
          (s === 'available' && p.available) ||
          (s === 'unavailable' && !p.available) ||
          (s === 'low' && stockLevel(p.stock) !== 'ok')) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q)),
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
  onCategory(v: string) {
    this.categoryFilter.set(v ? Number(v) : null);
    this.page.set(1);
  }
  setStatus(v: StatusFilter) {
    this.status.set(v);
    this.filterOpen.set(false);
    this.page.set(1);
  }
  goTo(p: number) {
    this.page.set(Math.min(Math.max(p, 1), this.pageCount()));
  }

  tone(p: Product) {
    return TONES[(p.id - 1) % TONES.length];
  }

  stockText(p: Product) {
    const level = stockLevel(p.stock);
    if (level === 'out') return 'Out of stock';
    return level === 'ok' ? `${p.stock} in stock` : `${p.stock} left`;
  }

  // ---------- Quick availability toggle (86 an item) ----------
  toggleAvailable(p: Product) {
    const available = !p.available;
    // TODO: PATCH /api/products/{id}/availability
    this.products.update((list) => list.map((x) => (x.id === p.id ? { ...x, available } : x)));
    available
      ? this.toast.success('Back on the menu', `${p.name} is available again.`)
      : this.toast.warning('Marked unavailable', `${p.name} is hidden from the POS menu.`);
  }

  // ---------- Create / edit ----------
  formOpen = signal(false);
  editing = signal<Product | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    sku: ['', Validators.pattern(/^[A-Za-z0-9-]{3,20}$/)],
    barcode: ['', Validators.pattern(/^\d{8,14}$/)],
    categoryId: this.fb.control<number | null>(null, Validators.required),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    stock: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+$/),
    ]),
    available: [true],
  });

  invalid(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  openCreate() {
    this.editing.set(null);
    this.form.reset({
      name: '',
      sku: '',
      barcode: '',
      categoryId: this.categoryFilter(),
      price: null,
      stock: 0,
      available: true,
    });
    this.resetExtras([], null);
    this.formOpen.set(true);
  }

  openEdit(p: Product) {
    this.editing.set(p);
    this.form.reset({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      categoryId: p.categoryId,
      price: p.price,
      stock: p.stock,
      available: p.available,
    });
    this.resetExtras(p.modifiers, p.image);
    this.formOpen.set(true);
  }

  private resetExtras(modifiers: string[], image: string | null) {
    this.modifiers.set([...modifiers]);
    this.addingMod.set(false);
    this.modDraft.set('');
    this.imagePreview.set(image);
    this.imageFile = null;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value = {
      name: raw.name.trim(),
      sku: raw.sku.trim().toUpperCase(),
      barcode: raw.barcode.trim(),
      categoryId: raw.categoryId!,
      price: raw.price!,
      stock: raw.stock!,
      available: raw.available,
      modifiers: this.modifiers(),
      image: this.imagePreview(),
    };

    const others = this.products().filter((p) => p.id !== this.editing()?.id);
    let clash = false;
    if (value.sku && others.some((p) => p.sku === value.sku)) {
      this.form.controls.sku.setErrors({ duplicate: true });
      clash = true;
    }
    if (value.barcode && others.some((p) => p.barcode === value.barcode)) {
      this.form.controls.barcode.setErrors({ duplicate: true });
      clash = true;
    }
    if (clash) return;

    const current = this.editing();
    if (current) {
      // TODO: PUT /api/products/{id} (multipart when imageFile is set)
      this.products.update((list) =>
        list.map((p) => (p.id === current.id ? { ...p, ...value } : p)),
      );
      this.toast.success('Changes saved', 'The item has been updated.');
    } else {
      // TODO: POST /api/products (multipart with imageFile)
      const id = Math.max(0, ...this.products().map((p) => p.id)) + 1;
      this.products.update((list) => [{ id, ...value }, ...list]);
      this.page.set(1);
      this.toast.success('Item created', 'The new item is now on the menu.');
    }
    this.formOpen.set(false);
  }

  // ---------- Photo ----------
  imagePreview = signal<string | null>(null);
  imageFile: File | null = null;

  onImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow picking the same file again
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      this.toast.error('Wrong file type', 'Use a PNG or JPG image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.toast.error('Image too large', 'Choose a photo up to 2 MB.');
      return;
    }
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageFile = null;
    this.imagePreview.set(null);
  }

  // ---------- Modifiers ----------
  modifiers = signal<string[]>([]);
  addingMod = signal(false);
  modDraft = signal('');
  private modInput = viewChild<ElementRef<HTMLInputElement>>('modInput');

  startAddMod() {
    this.addingMod.set(true);
    setTimeout(() => this.modInput()?.nativeElement.focus());
  }

  addModifier() {
    const text = this.modDraft().trim().slice(0, 30);
    if (text && !this.modifiers().some((m) => m.toLowerCase() === text.toLowerCase())) {
      this.modifiers.update((list) => [...list, text]);
    }
    this.modDraft.set('');
    // stay in the input so several can be typed in a row; empty Enter closes it
    if (!text) this.addingMod.set(false);
  }

  removeModifier(m: string) {
    this.modifiers.update((list) => list.filter((x) => x !== m));
  }

  // ---------- Delete ----------
  async remove(p: Product) {
    const ok = await this.confirm.ask({
      title: 'Delete menu item?',
      message: `Are you sure you want to delete ${p.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Dismiss',
      confirmIcon: 'hgi-delete-02',
    });
    if (!ok) return;
    // TODO: DELETE /api/products/{id}
    this.products.update((list) => list.filter((x) => x.id !== p.id));
    this.toast.success('Item deleted', `${p.name} has been removed from the menu.`);
  }
}
