import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  ACTIVE_ORDERS,
  CartLine,
  FREE_TABLES,
  MENU,
  MODIFIERS,
  MenuItem,
  START_CART,
  photo,
} from '../../data/pos.mock';
import { Modal } from '../../../../shared/components/modal/modal';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { BahtPipe } from '../../../../shared/pipes/baht.pipe';
import { OrderTypeLabelPipe } from '../../../../shared/pipes/order-type-label.pipe';
import { ToastService } from '../../../../core/notify/toast.service';
import { ConfirmService } from '../../../../core/notify/confirm.service';
import { OrderType } from '../../../../shared/enums/order-type';
import { PaymentMethod } from '../../../../shared/enums/payment-method';

const TAX_PERCENT = 7;
const round2 = (n: number) => Math.round(n * 100) / 100;

@Component({
  selector: 'app-pos',
  imports: [FormsModule, RouterLink, DatePipe, HeaderTools, Modal, BahtPipe, OrderTypeLabelPipe],
  templateUrl: './pos.html',
  styleUrl: './pos.css',
  // replaces the kit's "ORDER LINE CONTENT" wrapper (shell gives it full height)
  host: {
    class: 'flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 overflow-y-auto lg:overflow-hidden',
  },
})
export class Pos {
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  photo = photo;
  activeOrders = ACTIVE_ORDERS;
  freeTables = FREE_TABLES;
  modifierOptions = MODIFIERS;
  taxPercent = TAX_PERCENT;
  orderTypes: OrderType[] = ['dine_in', 'takeaway', 'delivery'];
  payMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'cash', label: 'Cash', icon: 'hgi-money-03' },
    { value: 'card', label: 'Card', icon: 'hgi-credit-card' },
    { value: 'qr', label: 'QR', icon: 'hgi-qr-code' },
  ];
  segOn = 'bg-[#00c066] text-white';
  segOff = 'border border-gray-200 text-gray-600 hover:bg-gray-50';

  // ---------- Menu ----------
  showBanner = signal(true);
  search = signal('');
  category = signal('All');
  categories = ['All', ...new Set(MENU.map((m) => m.category))];
  menu = computed(() => {
    const q = this.search().trim().toLowerCase();
    const c = this.category();
    return MENU.filter(
      (m) => (c === 'All' || m.category === c) && (!q || m.name.toLowerCase().includes(q)),
    );
  });

  // ---------- Current order ----------
  orderNo = signal(1043);
  orderId = computed(() => `ORD-${this.orderNo()}`);
  recipient = signal('Hilal Achmad');
  orderType = signal<OrderType>('dine_in');
  table = signal('19');
  cart = signal<CartLine[]>(START_CART);

  discountMode = signal<'percent' | 'amount'>('amount');
  discountValue = signal(85);

  itemCount = computed(() => this.cart().reduce((n, l) => n + l.qty, 0));
  subtotal = computed(() => this.cart().reduce((s, l) => s + l.item.price * l.qty, 0));
  discount = computed(() => {
    const v = Math.max(this.discountValue(), 0);
    const d = this.discountMode() === 'percent' ? (this.subtotal() * v) / 100 : v;
    return round2(Math.min(d, this.subtotal()));
  });
  tax = computed(() => round2(((this.subtotal() - this.discount()) * TAX_PERCENT) / 100));
  total = computed(() => round2(this.subtotal() - this.discount() + this.tax()));

  add(item: MenuItem) {
    this.cart.update((lines) => {
      const i = lines.findIndex(
        (l) => l.item.id === item.id && !l.modifiers.length && !l.instructions,
      );
      if (i === -1) return [...lines, { item, qty: 1, modifiers: [], instructions: '' }];
      return lines.map((l, idx) => (idx === i ? { ...l, qty: l.qty + 1 } : l));
    });
  }

  changeQty(index: number, delta: number) {
    this.cart.update((lines) =>
      lines
        .map((l, i) => (i === index ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  }

  async clearOrder() {
    if (!this.cart().length) return;
    const ok = await this.confirm.ask({
      title: 'Clear this order?',
      message: 'All items in the current order will be removed.',
      confirmText: 'Clear order',
      confirmIcon: 'hgi-delete-02',
    });
    if (!ok) return;
    this.cart.set([]);
    this.discountValue.set(0);
    this.toast.info('Order cleared', 'Start a new order when you are ready.');
  }

  sendToKitchen() {
    if (!this.cart().length) {
      this.toast.warning('Nothing to send', 'Add items to the order first.');
      return;
    }
    if (this.orderType() === 'dine_in' && !this.table()) {
      this.toast.warning('Pick a table', 'Dine-in orders need a table number.');
      this.tableOpen.set(true);
      return;
    }
    // TODO: POST /api/orders/{id}/send-to-kitchen
    this.toast.success('Sent to kitchen', 'The order is now in the kitchen queue.');
  }

  // ---------- Discount modal ----------
  discountOpen = signal(false);
  draftDiscountMode = signal<'percent' | 'amount'>('amount');
  draftDiscountValue = signal<number | null>(null);

  openDiscount() {
    this.draftDiscountMode.set(this.discountMode());
    this.draftDiscountValue.set(this.discountValue() || null);
    this.discountOpen.set(true);
  }

  applyDiscount() {
    this.discountMode.set(this.draftDiscountMode());
    this.discountValue.set(this.draftDiscountValue() ?? 0);
    this.discountOpen.set(false);
    this.toast.success('Discount applied', 'The order total has been updated.');
  }

  // ---------- Table modal ----------
  tableOpen = signal(false);

  pickTable(t: string) {
    this.table.set(t);
    this.tableOpen.set(false);
  }

  // ---------- Modifier modal ----------
  modifierOpen = signal(false);
  editing = signal<number | null>(null);
  draftMods = signal<string[]>([]);
  draftNote = signal('');
  editingName = computed(() => {
    const i = this.editing();
    return i === null ? '' : (this.cart()[i]?.item.name ?? '');
  });

  openModifiers(index: number) {
    const line = this.cart()[index];
    this.editing.set(index);
    this.draftMods.set([...line.modifiers]);
    this.draftNote.set(line.instructions);
    this.modifierOpen.set(true);
  }

  toggleMod(mod: string) {
    this.draftMods.update((list) =>
      list.includes(mod) ? list.filter((m) => m !== mod) : [...list, mod],
    );
  }

  saveModifiers() {
    const index = this.editing();
    this.cart.update((lines) =>
      lines.map((l, i) =>
        i === index
          ? { ...l, modifiers: this.draftMods(), instructions: this.draftNote().trim() }
          : l,
      ),
    );
    this.modifierOpen.set(false);
    this.toast.success('Modifiers saved', 'The item has been updated in the order.');
  }

  // ---------- Split bill modal ----------
  splitOpen = signal(false);
  splitMode = signal<'even' | 'item'>('even'); // TODO: "by item" screen
  guests = signal<number | null>(2);
  perGuest = computed(() => round2(this.total() / Math.max(this.guests() ?? 1, 1)));

  printSplit() {
    this.splitOpen.set(false);
    // TODO: POST /api/orders/{id}/split
    this.toast.info('Printing bills', 'Split bills have been sent to the printer.');
  }

  // ---------- Payment modal ----------
  paymentOpen = signal(false);
  splitPay = signal(false);
  payMethod = signal<PaymentMethod>('cash');
  cashReceived = signal<number | null>(null);
  splitCash = signal(0);
  splitCard = signal(0);
  splitQr = signal(0);
  splitRows = [
    { label: 'Cash', icon: 'hgi-money-03', amount: this.splitCash },
    { label: 'Card', icon: 'hgi-credit-card', amount: this.splitCard },
    { label: 'QR', icon: 'hgi-qr-code', amount: this.splitQr },
  ];

  change = computed(() => round2(Math.max((this.cashReceived() ?? 0) - this.total(), 0)));
  remaining = computed(() =>
    round2(this.total() - this.splitCash() - this.splitCard() - this.splitQr()),
  );
  canComplete = computed(() => {
    if (this.splitPay()) return this.remaining() === 0;
    return this.payMethod() !== 'cash' || (this.cashReceived() ?? 0) >= this.total();
  });

  openPayment() {
    if (!this.cart().length) {
      this.toast.warning('Nothing to pay', 'Add items to the order first.');
      return;
    }
    this.splitPay.set(false);
    this.payMethod.set('cash');
    this.cashReceived.set(null);
    this.splitCash.set(this.total());
    this.splitCard.set(0);
    this.splitQr.set(0);
    this.paymentOpen.set(true);
  }

  // ---------- Receipt ----------
  receiptOpen = signal(false);
  paidAt = signal<Date | null>(null);

  completePayment() {
    if (!this.canComplete()) return;
    // TODO: POST /api/orders/{id}/payments
    this.paidAt.set(new Date());
    this.paymentOpen.set(false);
    this.receiptOpen.set(true);
    this.toast.success('Payment complete', `#${this.orderId()} has been paid.`);
  }

  print() {
    window.print();
  }

  /** after the receipt closes, start a fresh order */
  newOrder() {
    this.receiptOpen.set(false);
    this.cart.set([]);
    this.discountValue.set(0);
    this.orderNo.update((n) => n + 1);
  }
}
