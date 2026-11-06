import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { Modal } from '../../../../shared/components/modal/modal';
import { BahtPipe } from '../../../../shared/pipes/baht.pipe';
import { ToastService } from '../../../../core/notify/toast.service';
import { ConfirmService } from '../../../../core/notify/confirm.service';
import { mockTables, SECTIONS, STATUS_STYLE } from '../../data/tables.mock';
import { DiningTable, Section, TableStatus } from '../../data/table.modal';

const round2 = (n: number) => Math.round(n * 100) / 100;
const baht = (n: number) => '฿' + n.toLocaleString('en-US');

@Component({
  selector: 'app-tables',
  imports: [ReactiveFormsModule, DecimalPipe, HeaderTools, Modal, BahtPipe],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
  host: { class: 'block' },
})
export class Tables {
  private fb = inject(FormBuilder).nonNullable;
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  sections = SECTIONS;
  style = STATUS_STYLE;

  now = signal(Date.now());
  tables = signal<DiningTable[]>(mockTables(Date.now()));
  section = signal<Section>('main_hall');

  constructor() {
    const id = setInterval(() => this.now.set(Date.now()), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }

  // ---------- Derived ----------
  byId = computed(() => new Map(this.tables().map((t) => [t.id, t])));
  floor = computed(() => this.tables().filter((t) => t.section === this.section()));
  free = computed(() => this.tables().filter((t) => t.status === 'available'));
  /** tables with an open bill that are not already merged into another */
  billable = computed(() =>
    this.tables().filter(
      (t) => (t.status === 'occupied' || t.status === 'billing') && !t.mergedInto,
    ),
  );

  stats = computed(() => {
    const count = (s: TableStatus) => this.tables().filter((t) => t.status === s).length;
    return (['available', 'occupied', 'reserved', 'billing'] as TableStatus[]).map((s) => ({
      label: this.style[s].label,
      icon: this.style[s].icon,
      value: count(s),
    }));
  });

  sectionCount(s: Section) {
    return this.tables().filter((t) => t.section === s).length;
  }

  minutes(t: DiningTable) {
    return t.seatedAt ? Math.max(Math.floor((this.now() - t.seatedAt) / 60_000), 0) : 0;
  }

  /** small line under the seats, same wording as the kit */
  detail(t: DiningTable): string {
    if (t.mergedInto) return `Merged with ${this.byId().get(t.mergedInto)?.name ?? '—'}`;
    switch (t.status) {
      case 'occupied':
        return `${baht(t.bill ?? 0)} · ${this.minutes(t)}m · ${t.guests ?? 0} guests`;
      case 'billing':
        return `${baht(t.bill ?? 0)} · bill requested`;
      case 'reserved':
        return t.reservation ? `${t.reservation.time} · ${t.reservation.name}` : '';
      default:
        return '';
    }
  }

  // ---------- Table actions ----------
  actionsOpen = signal(false);
  selectedId = signal<number | null>(null);
  selected = computed(() => this.byId().get(this.selectedId() ?? -1) ?? null);
  /** where the shared bill lives (itself, or the table it was merged into) */
  billHolder = computed(() => {
    const t = this.selected();
    return t?.mergedInto ? (this.byId().get(t.mergedInto) ?? t) : t;
  });
  hasBill = computed(() => {
    const s = this.billHolder()?.status;
    return s === 'occupied' || s === 'billing';
  });

  open(t: DiningTable) {
    this.selectedId.set(t.id);
    this.actionsOpen.set(true);
  }

  openOrder() {
    const t = this.billHolder();
    if (!t) return;
    this.actionsOpen.set(false);
    this.router.navigate(['/pos'], { queryParams: { table: t.name } });
  }

  async markFree() {
    const t = this.billHolder();
    if (!t) return;
    const message =
      t.status === 'reserved'
        ? `The reservation for ${t.reservation?.name} at ${t.reservation?.time} will be cancelled.`
        : t.bill
          ? `The open bill of ${baht(t.bill)} will be closed. Only do this once it has been paid.`
          : `${t.name} will be marked as available.`;
    const ok = await this.confirm.ask({
      title: `Free table ${t.name}?`,
      message,
      confirmText: 'Mark free',
      confirmIcon: 'hgi-checkmark-circle-02',
      tone: 'warning',
    });
    if (!ok) return;
    // TODO: POST /api/tables/{id}/free
    const freeIds = new Set([
      t.id,
      ...this.tables()
        .filter((x) => x.mergedInto === t.id)
        .map((x) => x.id),
    ]);
    this.tables.update((list) => list.map((x) => (freeIds.has(x.id) ? this.cleared(x) : x)));
    this.actionsOpen.set(false);
    this.toast.success('Table freed', `${t.name} is now available.`);
  }

  private cleared(t: DiningTable): DiningTable {
    return { id: t.id, name: t.name, seats: t.seats, section: t.section, status: 'available' };
  }

  // ---------- Transfer ----------
  transferOpen = signal(false);
  transferTo = signal<number | null>(null);

  openTransfer() {
    this.transferTo.set(null);
    this.actionsOpen.set(false);
    this.transferOpen.set(true);
  }

  transfer() {
    const from = this.billHolder();
    const toId = this.transferTo();
    if (!from || toId === null) return;
    const to = this.byId().get(toId)!;
    // TODO: POST /api/tables/{from.id}/transfer { toTableId }
    this.tables.update((list) =>
      list.map((x) => {
        if (x.id === from.id) return this.cleared(x);
        if (x.id === toId)
          return {
            ...x,
            status: from.status,
            bill: from.bill,
            guests: from.guests,
            seatedAt: from.seatedAt,
          };
        if (x.mergedInto === from.id) return { ...x, mergedInto: toId };
        return x;
      }),
    );
    this.transferOpen.set(false);
    this.toast.success('Table transferred', `The order has moved from ${from.name} to ${to.name}.`);
  }

  // ---------- Merge ----------
  mergeOpen = signal(false);
  mergeIds = signal<number[]>([]);
  mergeTotal = computed(() =>
    this.mergeIds().reduce((s, id) => s + (this.byId().get(id)?.bill ?? 0), 0),
  );

  openMerge(from?: DiningTable | null) {
    this.mergeIds.set(from && !from.mergedInto && this.hasBill() ? [from.id] : []);
    this.actionsOpen.set(false);
    this.mergeOpen.set(true);
  }

  toggleMerge(id: number) {
    this.mergeIds.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  merge() {
    const ids = this.mergeIds();
    if (ids.length < 2) return;
    const [hostId, ...rest] = ids; // first picked holds the shared bill
    const host = this.byId().get(hostId)!;
    const guests = ids.reduce((s, id) => s + (this.byId().get(id)?.guests ?? 0), 0);
    const seatedAt = Math.min(...ids.map((id) => this.byId().get(id)?.seatedAt ?? Date.now()));
    // TODO: POST /api/tables/merge { hostTableId, tableIds }
    this.tables.update((list) =>
      list.map((x) => {
        if (x.id === hostId) return { ...x, bill: this.mergeTotal(), guests, seatedAt };
        if (rest.includes(x.id)) return { ...x, status: 'occupied', bill: 0, mergedInto: hostId };
        if (x.mergedInto && rest.includes(x.mergedInto)) return { ...x, mergedInto: hostId };
        return x;
      }),
    );
    this.mergeOpen.set(false);
    this.toast.success('Tables merged', `The selected tables now share one bill on ${host.name}.`);
  }

  // ---------- Split ----------
  splitOpen = signal(false);
  splitMode = signal<'even' | 'item'>('even'); // TODO: "by item" screen
  guests = signal<number | null>(2);
  perGuest = computed(() =>
    round2((this.billHolder()?.bill ?? 0) / Math.max(this.guests() ?? 1, 1)),
  );

  openSplit() {
    this.splitMode.set('even');
    this.guests.set(this.billHolder()?.guests || 2);
    this.actionsOpen.set(false);
    this.splitOpen.set(true);
  }

  printSplit() {
    // TODO: POST /api/orders/{id}/split
    this.splitOpen.set(false);
    this.toast.info('Printing bills', 'Split bills have been sent to the printer.');
  }

  // ---------- Add table ----------
  addOpen = signal(false);
  addForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(12)]],
    seats: this.fb.control<number | null>(4, [
      Validators.required,
      Validators.min(1),
      Validators.max(30),
    ]),
    section: this.fb.control<Section>('main_hall'),
  });

  invalid(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  openAdd() {
    this.addForm.reset({ name: '', seats: 4, section: this.section() });
    this.addOpen.set(true);
  }

  addTable() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const { name, seats, section } = this.addForm.getRawValue();
    const clean = name.trim();
    if (this.tables().some((t) => t.name.toLowerCase() === clean.toLowerCase())) {
      this.addForm.controls.name.setErrors({ duplicate: true });
      return;
    }
    // TODO: POST /api/tables
    const id = Math.max(0, ...this.tables().map((t) => t.id)) + 1;
    this.tables.update((list) => [
      ...list,
      { id, name: clean, seats: seats!, section, status: 'available' },
    ]);
    this.section.set(section);
    this.addOpen.set(false);
    this.toast.success('Table added', 'The new table is now on the floor plan.');
  }
}
