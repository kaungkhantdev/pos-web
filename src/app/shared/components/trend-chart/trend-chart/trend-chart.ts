import { Component, computed, input } from '@angular/core';
import { Point, smoothPath } from '../../../utils/smooth-path';

const X0 = 60,
  X1 = 979,
  Y_BASE = 220,
  Y_TOP = 20,
  STEPS = 4;
const NICE = [1, 1.5, 2, 2.5, 5, 7.5, 10];

function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return (NICE.find((m) => m * pow >= raw) ?? 10) * pow;
}

/** 27000 → ฿27k, 22500 → ฿22.5k, 800 → ฿800 */
export function shortBaht(n: number) {
  if (Math.abs(n) < 1000) return `฿${n}`;
  return `฿${(n / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k`;
}

@Component({
  selector: 'app-trend-chart',
  template: './trend-chart.html',
})
export class TrendChart {
  labels = input.required<string[]>();
  values = input.required<number[]>();

  gridY = [20, 70, 120, 170, 220];

  step = computed(() => niceStep(Math.max(...this.values(), 0) / STEPS));
  top = computed(() => this.step() * STEPS);

  points = computed<Point[]>(() => {
    const v = this.values();
    const n = Math.max(v.length - 1, 1);
    return v.map(
      (val, i) =>
        [X0 + ((X1 - X0) * i) / n, Y_BASE - (val / this.top()) * (Y_BASE - Y_TOP)] as const,
    );
  });
  line = computed(() => smoothPath(this.points()));
  area = computed(() => {
    const p = this.points();
    return `${this.line()} L ${p[p.length - 1][0]},${Y_BASE} L ${p[0][0]},${Y_BASE} Z`;
  });

  peakIndex = computed(() => {
    const v = this.values();
    return v.indexOf(Math.max(...v));
  });
  peak = computed(() => {
    const [x, y] = this.points()[this.peakIndex()];
    const text = shortBaht(this.values()[this.peakIndex()]);
    const tipW = 18 + text.length * 7;
    const tipX = Math.min(Math.max(x, X0 + tipW / 2), 995 - tipW / 2);
    return { x, y, text, tipW, tipX, tipY: Math.max(y - 36, 4) };
  });

  yLabels = computed(() =>
    Array.from({ length: STEPS + 1 }, (_, k) => ({
      y: 24 + k * 50,
      text: shortBaht(this.top() - k * this.step()),
    })),
  );
  xLabels = computed(() =>
    this.labels().map((text, i) => ({
      text,
      x: this.points()[i]?.[0] ?? 0,
      peak: i === this.peakIndex(),
    })),
  );
  label = computed(
    () => `Sales trend, peaking at ${this.peak().text} on ${this.labels()[this.peakIndex()] ?? ''}`,
  );
}
