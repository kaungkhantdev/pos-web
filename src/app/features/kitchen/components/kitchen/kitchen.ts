import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { OrderTypeLabelPipe } from '../../../../shared/pipes/order-type-label.pipe';
import { ToastService } from '../../../../core/notify/toast.service';
import { mockTickets, Ticket, TicketStatus } from '../../data/kitchen.mock';
import { OrderType } from '../../../../shared/enums/order-type';

const PRIORITY_AFTER = 8 * 60_000; // preparing longer than this → priority

@Component({
  selector: 'app-kitchen',
  imports: [DatePipe, HeaderTools, OrderTypeLabelPipe],
  templateUrl: './kitchen.html',
  // replaces the kit's <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
  host: { class: 'flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden' },
})
export class Kitchen {
  private toast = inject(ToastService);

  now = signal(Date.now());
  tickets = signal<Ticket[]>(mockTickets(Date.now()));
  filter = signal<OrderType | 'all'>('all');
  filters: (OrderType | 'all')[] = ['all', 'dine_in', 'takeaway', 'delivery'];

  columns: { status: TicketStatus; label: string; dot: string }[] = [
    { status: 'queued', label: 'Queued', dot: 'bg-gray-400' },
    { status: 'preparing', label: 'Preparing', dot: 'bg-amber-400' },
    { status: 'ready', label: 'Ready', dot: 'bg-green-500' },
    { status: 'completed', label: 'Completed', dot: 'bg-indigo-500' },
  ];

  board = computed(() => {
    const f = this.filter();
    const board: Record<TicketStatus, Ticket[]> = {
      queued: [],
      preparing: [],
      ready: [],
      completed: [],
    };
    for (const t of this.tickets()) {
      if (f === 'all' || t.type === f) board[t.status].push(t);
    }
    return board;
  });

  constructor() {
    const id = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }

  isPriority(t: Ticket) {
    return t.status === 'preparing' && this.now() - (t.startedAt ?? t.createdAt) >= PRIORITY_AFTER;
  }

  timer(t: Ticket): string {
    if (t.status === 'ready') return 'ready';
    if (t.status === 'completed') return 'served';
    const since = t.status === 'preparing' ? (t.startedAt ?? t.createdAt) : t.createdAt;
    const ms = this.now() - since;
    if (t.status === 'queued' && ms < 60_000) return 'just now';
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  timerClass(t: Ticket): string {
    if (this.isPriority(t)) return 'text-red-600 bg-red-50';
    const map: Record<TicketStatus, string> = {
      queued: 'text-gray-500 bg-gray-100',
      preparing: 'text-amber-600 bg-amber-50',
      ready: 'text-green-600 bg-green-50',
      completed: 'text-indigo-600 bg-indigo-50',
    };
    return map[t.status];
  }

  cookMinutes(t: Ticket) {
    return Math.round(((t.servedAt ?? this.now()) - t.createdAt) / 60_000);
  }

  start(t: Ticket) {
    this.update(t.id, { status: 'preparing', startedAt: Date.now() });
  }

  markReady(t: Ticket) {
    this.update(t.id, { status: 'ready' });
    this.toast.success('Order ready', 'Front of house has been told it is ready to serve.');
  }

  bump(t: Ticket) {
    this.update(t.id, { status: 'completed', servedAt: Date.now() });
  }

  private update(id: string, patch: Partial<Ticket>) {
    // TODO: PATCH /api/kitchen-tickets/{id}
    this.tickets.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }
}
