import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  DAILY_TREND,
  INGREDIENT_USAGE,
  LAYOUT,
  MONTHLY_TREND,
  OTHER_COSTS,
  PERIODS,
  PRODUCTS,
  Period,
  REPORT_TYPES,
  ReportType,
  STAFF,
  SUMMARY,
} from '../../data/reports.mock';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { TrendChart } from '../../../../shared/components/trend-chart/trend-chart/trend-chart';
import { BahtPipe } from '../../../../shared/pipes/baht.pipe';
import { ToastService } from '../../../../core/notify/toast.service';

const DAY = 86_400_000;
const TONES = [
  'bg-[#00c066]/10 text-[#00994f]',
  'bg-blue-50 text-blue-500',
  'bg-amber-50 text-amber-500',
  'bg-purple-50 text-purple-500',
];

/** current and previous date range for a period */
function periodRange(p: Period, now = new Date()) {
  const y = now.getFullYear(),
    m = now.getMonth(),
    d = now.getDate();
  switch (p) {
    case 'today':
      return {
        from: new Date(y, m, d),
        to: new Date(y, m, d),
        prevFrom: new Date(y, m, d - 1),
        prevTo: new Date(y, m, d - 1),
      };
    case 'week': {
      const start = d - ((now.getDay() + 6) % 7); // Monday
      return {
        from: new Date(y, m, start),
        to: new Date(y, m, start + 6),
        prevFrom: new Date(y, m, start - 7),
        prevTo: new Date(y, m, start - 1),
      };
    }
    case 'month':
      return {
        from: new Date(y, m, 1),
        to: new Date(y, m + 1, 0),
        prevFrom: new Date(y, m - 1, 1),
        prevTo: new Date(y, m, 0),
      };
    case 'year':
      return {
        from: new Date(y, 0, 1),
        to: new Date(y, 11, 31),
        prevFrom: new Date(y - 1, 0, 1),
        prevTo: new Date(y - 1, 11, 31),
      };
  }
}

@Component({
  selector: 'app-reports',
  imports: [DatePipe, DecimalPipe, NgTemplateOutlet, HeaderTools, TrendChart, BahtPipe],
  templateUrl: './reports.html',
  host: { class: 'block' },
})
export class Reports {
  private toast = inject(ToastService);

  types = REPORT_TYPES;
  periods = PERIODS;
  updatedAt = new Date();

  report = signal<ReportType>('daily');
  period = signal<Period>('month');

  layout = computed(() => LAYOUT[this.report()]);
  reportLabel = computed(() => REPORT_TYPES.find((t) => t.key === this.report())!.label);
  periodInfo = computed(() => PERIODS.find((p) => p.key === this.period())!);
  range = computed(() => periodRange(this.period()));
  days = computed(() => Math.round((+this.range().to - +this.range().from) / DAY) + 1);

  /** mock only: scale month figures to the chosen period */
  private scale = computed(() => SUMMARY[this.period()].gross / SUMMARY.month.gross);

  // ---------- Overview ----------
  trend = computed(() => (this.report() === 'monthly' ? MONTHLY_TREND : DAILY_TREND));
  summary = computed(() => {
    const s = SUMMARY[this.period()];
    return {
      ...s,
      net: this.profit().net,
      margin: this.profit().margin,
      avg: s.gross / s.orders,
      perDay: s.orders / this.days(),
    };
  });

  // ---------- Lists ----------
  products = computed(() => {
    const k = this.scale();
    return PRODUCTS.map((p) => ({
      ...p,
      units: Math.round(p.units * k),
      revenue: Math.round(p.revenue * k),
    })).sort((a, b) => b.units - a.units);
  });
  maxUnits = computed(() => this.products()[0]?.units || 1);

  staff = computed(() => {
    const k = this.scale();
    return STAFF.map((s) => ({
      ...s,
      orders: Math.round(s.orders * k),
      sales: Math.round(s.sales * k),
    })).sort((a, b) => b.sales - a.sales);
  });
  maxSales = computed(() => this.staff()[0]?.sales || 1);

  ingredients = computed(() => {
    const k = this.scale();
    const rows = INGREDIENT_USAGE.map((i) => ({
      ...i,
      used: Math.round(i.used * k * 10) / 10,
      cost: Math.round(i.cost * k),
    })).sort((a, b) => b.cost - a.cost);
    const total = rows.reduce((s, r) => s + r.cost, 0);
    return { total, rows: rows.map((r) => ({ ...r, share: total ? (r.cost / total) * 100 : 0 })) };
  });

  // ---------- Profit ----------
  profit = computed(() => {
    const k = this.scale();
    const gross = SUMMARY[this.period()].gross;
    const pct = (n: number) => (gross ? (n / gross) * 100 : 0);
    const costs = [
      { label: 'Ingredient cost', amount: this.ingredients().total, color: 'bg-[#4dd494]' },
      ...OTHER_COSTS.map((c) => ({ ...c, amount: Math.round(c.amount * k) })),
    ];
    const net = gross - costs.reduce((s, c) => s + c.amount, 0);
    return {
      gross,
      net,
      margin: pct(net),
      netShare: Math.max(pct(net), 0),
      costs: costs.map((c) => ({ ...c, share: pct(c.amount) })),
    };
  });

  // ---------- Helpers ----------
  tone(i: number) {
    return TONES[i % TONES.length];
  }

  initials(name: string) {
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }

  abs(n: number) {
    return Math.abs(n);
  }

  // ---------- Export ----------
  export() {
    const csv = this.csvRows()
      .map((row) =>
        row
          .map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c))
          .join(','),
      )
      .join('\n');
    // BOM so Excel opens Thai text correctly
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.report()}-${this.period()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Report exported', `${this.reportLabel()} has been downloaded as CSV.`);
  }

  private csvRows(): (string | number)[][] {
    switch (this.report()) {
      case 'daily':
      case 'monthly': {
        const t = this.trend();
        return [['Period', 'Sales (THB)'], ...t.labels.map((l, i) => [l, t.values[i]])];
      }
      case 'menu':
        return [
          ['Product', 'Units sold', 'Revenue (THB)'],
          ...this.products().map((p) => [p.name, p.units, p.revenue]),
        ];
      case 'staff':
        return [
          ['Staff', 'Role', 'Orders', 'Sales (THB)'],
          ...this.staff().map((s) => [s.name, s.role, s.orders, s.sales]),
        ];
      case 'ingredients':
        return [
          ['Ingredient', 'Used', 'Unit', 'Cost (THB)', 'Share (%)'],
          ...this.ingredients().rows.map((r) => [
            r.name,
            r.used,
            r.unit,
            r.cost,
            r.share.toFixed(1),
          ]),
        ];
      case 'profit': {
        const p = this.profit();
        return [
          ['Line', 'Amount (THB)'],
          ['Gross sales', p.gross],
          ...p.costs.map((c) => [c.label, -c.amount]),
          ['Net profit', p.net],
        ];
      }
    }
  }
}
