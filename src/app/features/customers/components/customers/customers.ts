import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/notify/toast.service';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { Modal } from '../../../../shared/components/modal/modal';
import { BahtPipe } from '../../../../shared/pipes/baht.pipe';
import { OrderTypeLabelPipe } from '../../../../shared/pipes/order-type-label.pipe';
import { ConfirmService } from '../../../../core/notify/confirm.service';
import {
  CUSTOMERS,
  TIERS,
  tierOf,
  CUSTOMER_ORDERS,
  POINTS_PER_BAHT,
} from '../../data/customers.mock';
import { Customer, Tier } from '../../data/customer.modal';

const PAGE_SIZE = 10;
const THAI_PHONE = /^0\d{1,2}-?\d{3}-?\d{4}$/;
const TONES = [
  'bg-[#00c066]/10 text-[#00994f]',
  'bg-blue-50 text-blue-500',
  'bg-amber-50 text-amber-500',
  'bg-purple-50 text-purple-500',
];
const digits = (s: string) => s.replace(/\D/g, '');

@Component({
  selector: 'app-customers',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    HeaderTools,
    Modal,
    BahtPipe,
    OrderTypeLabelPipe,
  ],
  templateUrl: './customers.html',
  host: { class: 'block' },
})
export class Customers {
  private fb = inject(FormBuilder).nonNullable;
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  tiers = TIERS;
  tierOf = tierOf;

  customers = signal<Customer[]>(CUSTOMERS);

  // ---------- Search, filter, paging ----------
  search = signal('');
  tier = signal<Tier | 'all'>('all');
  filterOpen = signal(false);
  page = signal(1);
  tierOptions: { value: Tier | 'all'; label: string }[] = [
    { value: 'all', label: 'All tiers' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'bronze', label: 'Bronze' },
  ];

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const qDigits = digits(q);
    const t = this.tier();
    return this.customers().filter(
      (c) =>
        (t === 'all' || tierOf(c.points) === t) &&
        (!q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (qDigits.length >= 3 && digits(c.phone).includes(qDigits))),
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

  setTier(value: Tier | 'all') {
    this.tier.set(value);
    this.filterOpen.set(false);
    this.page.set(1);
  }

  goTo(p: number) {
    this.page.set(Math.min(Math.max(p, 1), this.pageCount()));
  }

  // ---------- Avatar ----------
  initials(c: Customer) {
    const parts = c.name.trim().split(/\s+/);
    return (
      (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')
    ).toUpperCase();
  }

  tone(c: Customer) {
    return TONES[(c.id - 1) % TONES.length];
  }

  // ---------- Create / edit ----------
  formOpen = signal(false);
  editing = signal<Customer | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    phone: ['', Validators.pattern(THAI_PHONE)],
    email: ['', [Validators.email, Validators.maxLength(120)]],
  });

  invalid(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  openCreate() {
    this.editing.set(null);
    this.form.reset({ name: '', phone: '', email: '' });
    this.formOpen.set(true);
  }

  openEdit(c: Customer) {
    this.editing.set(c);
    this.form.reset({ name: c.name, phone: c.phone, email: c.email });
    this.formOpen.set(true);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const value = {
      name: raw.name.trim(),
      phone: raw.phone.trim(),
      email: raw.email.trim().toLowerCase(),
    };

    // phone is how cashiers look customers up, so keep it unique
    const phoneTaken =
      value.phone &&
      this.customers().some(
        (c) => c.id !== this.editing()?.id && digits(c.phone) === digits(value.phone),
      );
    if (phoneTaken) {
      this.form.controls.phone.setErrors({ duplicate: true });
      return;
    }

    const current = this.editing();
    if (current) {
      // TODO: PUT /api/customers/{id}
      this.customers.update((list) =>
        list.map((c) => (c.id === current.id ? { ...c, ...value } : c)),
      );
      this.toast.success('Changes saved', 'The customer details have been updated.');
    } else {
      // TODO: POST /api/customers
      const id = Math.max(0, ...this.customers().map((c) => c.id)) + 1;
      this.customers.update((list) => [
        { id, ...value, orderCount: 0, totalSpent: 0, points: 0, lastVisit: null },
        ...list,
      ]);
      this.page.set(1);
      this.toast.success('Customer added', 'The customer has been added to your list.');
    }
    this.formOpen.set(false);
  }

  // ---------- History ----------
  historyOpen = signal(false);
  viewing = signal<Customer | null>(null);
  history = computed(() => {
    const c = this.viewing();
    if (!c) return [];
    // TODO: GET /api/customers/{id}/orders
    return CUSTOMER_ORDERS.filter((o) => o.customerId === c.id)
      .sort((a, b) => b.at.localeCompare(a.at))
      .map((o) => ({ ...o, earned: Math.floor(o.total * POINTS_PER_BAHT) }));
  });

  openHistory(c: Customer) {
    this.viewing.set(c);
    this.historyOpen.set(true);
  }

  // ---------- Delete ----------
  async remove(c: Customer) {
    const ok = await this.confirm.ask({
      title: 'Delete customer?',
      message: `Are you sure you want to delete ${c.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Dismiss',
      confirmIcon: 'hgi-delete-02',
    });
    if (!ok) return;
    // TODO: DELETE /api/customers/{id}
    this.customers.update((list) => list.filter((x) => x.id !== c.id));
    this.toast.success('Customer deleted', `${c.name} has been removed.`);
  }
}
