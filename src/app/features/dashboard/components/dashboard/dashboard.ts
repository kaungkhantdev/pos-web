import { Component } from '@angular/core';
import { DatePipe, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CATEGORY_SALES,
  LOW_STOCK,
  PaidStatus,
  POPULAR_ITEMS,
  RECENT_ORDERS,
  STATS,
} from '../../data/dashboard.mock';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { RevenueChart } from '../revenue-chart/revenue-chart';
import { CategoryDonut } from '../category-donut/category-donut';
import { BahtPipe } from '../../../../shared/pipes/baht.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    NgTemplateOutlet,
    HeaderTools,
    RevenueChart,
    CategoryDonut,
    BahtPipe,
  ],
  templateUrl: './dashboard.html',
  host: { class: 'block' },
})
export class Dashboard {
  userName = 'Somchai'; // TODO: from AuthService
  today = new Date();
  greeting = this.greet(this.today.getHours());

  stats = STATS;
  categorySales = CATEGORY_SALES;
  lowStock = LOW_STOCK;
  recentOrders = RECENT_ORDERS;
  popular = POPULAR_ITEMS;

  statusClass: Record<PaidStatus, string> = {
    paid: 'bg-green-50 text-green-600',
    refunded: 'bg-amber-50 text-amber-600',
  };

  private greet(hour: number) {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
