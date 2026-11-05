import { Component, computed, signal } from '@angular/core';
import { REVENUE, RevenueRange } from '../../data/dashboard.mock';


const X0 = 60,
  X1 = 709,
  Y_BASE = 220,
  Y_TOP = 20,
  V_MAX = 60;
type Point = readonly [number, number];

/** Smooth curve through the points (same maths as the kit) */
function smooth(p: Point[]): string {
  let d = `M ${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i],
      p1 = p[i],
      p2 = p[i + 1],
      p3 = p[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6,
      c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6,
      c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const xAt = (i: number, n: number) => X0 + ((X1 - X0) * i) / (n - 1);

@Component({
  imports: [],
  selector: 'app-revenue-chart',
  host: { class: 'block bg-white rounded-2xl p-4' },
  styleUrl: './revenue-chart.css',
  templateUrl: './revenue-chart.html',
})
export class RevenueChart {
  ranges: { key: RevenueRange; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];
  gridY = [20, 70, 120, 170, 220];
  yLabels = [
    { y: 24, text: '฿60k' },
    { y: 74, text: '฿45k' },
    { y: 124, text: '฿30k' },
    { y: 174, text: '฿15k' },
    { y: 224, text: '฿0k' },
  ];

  range = signal<RevenueRange>('year');
  data = computed(() => REVENUE[this.range()]);

  points = computed<Point[]>(() => {
    const v = this.data().values;
    return v.map(
      (val, i) => [xAt(i, v.length), Y_BASE - (val / V_MAX) * (Y_BASE - Y_TOP)] as const,
    );
  });
  line = computed(() => smooth(this.points()));
  last = computed(() => this.points()[this.points().length - 1]);
  area = computed(
    () => `${this.line()} L ${this.last()[0]},${Y_BASE} L ${this.points()[0][0]},${Y_BASE} Z`,
  );
  xLabels = computed(() =>
    this.data().labels.map((text, i, all) => ({ text, x: xAt(i, all.length) })),
  );
  tipX = computed(() => Math.min(this.last()[0], 702));
  tipY = computed(() => Math.max(this.last()[1] - 34, 4));
}
