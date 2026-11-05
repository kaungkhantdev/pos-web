import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'baht',
})
export class BahtPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals?: number): string {
    const fmt = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 2,
    });
    return '฿' + fmt.format(value ?? 0);
  }
}
