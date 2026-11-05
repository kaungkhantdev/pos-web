import { Pipe, PipeTransform } from '@angular/core';
import { OrderType } from '../enums/order-type';

const LABELS: Record<OrderType, string> = {
  dine_in: 'Dine-in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

@Pipe({
  name: 'orderTypeLabel',
})
export class OrderTypeLabelPipe implements PipeTransform {
  transform(value: OrderType): unknown {
    return LABELS[value];
  }
}
