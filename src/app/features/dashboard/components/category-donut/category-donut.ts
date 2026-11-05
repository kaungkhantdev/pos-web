import { Component, computed, input } from '@angular/core';
import { CategorySale } from '../../data/dashboard.mock';
import { DecimalPipe } from '@angular/common';

const C = 80,
  R_OUT = 69,
  R_IN = 51,
  GAP = 8;
const deg = (rad: number) => (rad * 180) / Math.PI;
const PAD_OUT = deg(Math.asin(GAP / R_OUT));
const PAD_IN = deg(Math.asin(GAP / R_IN));

function pt(r: number, angle: number) {
  const a = (angle * Math.PI) / 180;
  return `${(C + r * Math.sin(a)).toFixed(2)} ${(C - r * Math.cos(a)).toFixed(2)}`;
}

/** Ring slice from `start` to `end` degrees (0 = top, clockwise) */
function slice(start: number, end: number) {
  const large = end - start - 2 * PAD_OUT > 180 ? 1 : 0;
  return (
    `M${pt(R_OUT, start + PAD_OUT)} A${R_OUT} ${R_OUT} 0 ${large} 1 ${pt(R_OUT, end - PAD_OUT)} ` +
    `L${pt(R_IN, end - PAD_IN)} A${R_IN} ${R_IN} 0 ${large} 0 ${pt(R_IN, start + PAD_IN)} Z`
  );
}

@Component({
  imports: [DecimalPipe],
  selector: 'app-category-donut',
  host: { class: 'block bg-white rounded-2xl p-4' },
  styleUrl: './category-donut.css',
  templateUrl: './category-donut.html',
})
export class CategoryDonut {
  data = input.required<CategorySale[]>();

  total = computed(() => this.data().reduce((sum, c) => sum + c.orders, 0));

  segments = computed(() => {
    const total = this.total() || 1;
    let start = 0;
    return this.data().map((c, i) => {
      const sweep = (c.orders / total) * 360;
      const seg = {
        ...c,
        id: `donutSeg${i}`,
        path: slice(start, start + sweep),
        percent: Math.round((c.orders / total) * 100),
      };
      start += sweep;
      return seg;
    });
  });
}
