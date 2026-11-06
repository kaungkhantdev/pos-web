import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { OrderType } from '../../../../shared/enums/order-type';
import { Modal } from '../../../../shared/components/modal/modal';
import { BahtPipe } from '../../../../shared/pipes/baht.pipe';
import { OrderTypeLabelPipe } from '../../../../shared/pipes/order-type-label.pipe';
import { ToastService } from '../../../../core/notify/toast.service';
import { ORDERS, STATUS_STYLE, TAX_PERCENT, TYPE_STYLE } from '../../data/orders.mock';
import { Order, OrderStatus } from '../../data/order.model';

type Tab = 'all' | OrderType | 'completed';

const PAGE_SIZE = 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

@Component({
  selector: 'app-orders',
  imports: [DatePipe, RouterLink, HeaderTools, Modal, BahtPipe, OrderTypeLabelPipe],
  templateUrl: './orders.html',
  host: { class: 'block' },
})
export class Orders {
  private router = inject(Router);
  private toast = inject(ToastService);

  statusStyle = STATUS_STYLE;
  typeStyle = TYPE_STYLE;
  taxPercent = TAX_PERCENT;
  /** the kit's switcher: Open is the starting state, so it is not a button */
  statusSteps: OrderStatus[] = ['preparing', 'ready', 'served', 'paid'];

  orders = signal<Order[]>(ORDERS);

  // ---------- Money ----------
  subtotal(o: Order) {
    return o.lines.reduce((s, l) => s + l.price * l.qty, 0);
  }
  tax(o: Order) {
    return round2((this.subtotal(o) * TAX_PERCENT) / 100);
  }
  total(o: Order) {
    return round2(this.subtotal(o) + this.tax(o));
  }
  itemCount(o: Order) {
    return o.lines.reduce((n, l) => n + l.qty, 0);
  }

  /** "Table T1", "#A-231 · Walk-in", "#D-118 · Anong P." */
  where(o: Order) {
    return o.type === 'dine_in' ? `Table ${o.table}` : `#${o.ref} · ${o.customer ?? 'Walk-in'}`;
  }

  // ---------- Stats ----------
  stats = computed(() => {
    const open = this.orders().filter((o) => o.status !== 'paid');
    const count = (t: OrderType) => open.filter((o) => o.type === t).length;
    return [
      {
        label: 'Open Orders',
        value: open.length,
        icon: 'hgi-invoice-03' as string | null,
        paths: [] as string[],
      },
      { label: 'Dine-in', value: count('dine_in'), icon: null, paths: TYPE_STYLE.dine_in.paths },
      { label: 'Takeaway', value: count('takeaway'), icon: null, paths: TYPE_STYLE.takeaway.paths },
      { label: 'Delivery', value: count('delivery'), icon: null, paths: TYPE_STYLE.delivery.paths },
    ];
  });

  // ---------- Tabs, search, paging ----------
  tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'dine_in', label: 'Dine-in' },
    { key: 'takeaway', label: 'Takeaway' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'completed', label: 'Completed' },
  ];
  tab = signal<Tab>('all');
  search = signal('');
  page = signal(1);

  filtered = computed(() => {
    const t = this.tab();
    const q = this.search().trim().toLowerCase().replace(/^#/, '');
    return this.orders()
      .filter((o) => (t === 'all' ? true : t === 'completed' ? o.status === 'paid' : o.type === t))
      .filter(
        (o) =>
          !q ||
          o.id.toLowerCase().includes(q) ||
          (o.table ?? '').toLowerCase() === q ||
          (o.ref ?? '').toLowerCase().includes(q) ||
          (o.customer ?? '').toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
  pageCount = computed(() => Math.max(Math.ceil(this.filtered().length / PAGE_SIZE), 1));
  rows = computed(() => {
    const start = (Math.min(this.page(), this.pageCount()) - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });
  pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i + 1));

  setTab(t: Tab) {
    this.tab.set(t);
    this.page.set(1);
  }

  onSearch(value: string) {
    this.search.set(value);
    this.page.set(1);
  }

  goTo(p: number) {
    this.page.set(Math.min(Math.max(p, 1), this.pageCount()));
  }

  // ---------- Detail ----------
  detailOpen = signal(false);
  viewingId = signal<string | null>(null);
  viewing = computed(() => this.orders().find((o) => o.id === this.viewingId()) ?? null);

  view(o: Order) {
    this.viewingId.set(o.id);
    this.detailOpen.set(true);
  }

  setStatus(o: Order, status: OrderStatus) {
    if (status === o.status) return;
    if (status === 'paid') {
      // payment must go through POS so the money is recorded
      this.pay(o);
      return;
    }
    // TODO: PATCH /api/orders/{id}/status
    this.orders.update((list) => list.map((x) => (x.id === o.id ? { ...x, status } : x)));
    this.toast.success(
      'Status updated',
      `#${o.id} is now ${STATUS_STYLE[status].label.toLowerCase()}.`,
    );
  }

  pay(o: Order) {
    this.detailOpen.set(false);
    this.router.navigate(['/pos'], { queryParams: { order: o.id } });
  }

  print(o: Order) {
    // TODO: send to the receipt / kitchen printer instead of the browser dialog
    this.viewingId.set(o.id);
    window.print();
  }
}
