import { computed, signal, Service } from '@angular/core';
import { ShopSettings } from './settings.model';

// TODO: load with GET /api/settings at startup, save with PUT /api/settings
const DEFAULTS: ShopSettings = {
  shop: {
    name: 'Astronity POS',
    address: '123 Sukhumvit Rd, Bangkok 10110',
    phone: '02-123-4567',
    currency: 'THB',
  },
  tax: { rate: 7, taxId: '0105551234567', inclusive: false },
  receipt: { header: 'Astronity POS', footer: 'Thank you — see you again!' },
  payments: { cash: true, card: true, qr: true },
  printer: {
    receipt: 'epson-t88',
    kitchen: 'epson-u220',
    paper: '80mm',
    copies: 1,
    autoKitchen: true,
    autoReceipt: true,
    cashDrawer: true,
  },
};

@Service()
export class SettingsService {
  private state = signal<ShopSettings>(structuredClone(DEFAULTS));

  readonly settings = this.state.asReadonly();
  readonly taxRate = computed(() => this.state().tax.rate);
  readonly payments = computed(() => this.state().payments);

  async save(next: ShopSettings): Promise<void> {
    // TODO: await firstValueFrom(this.http.put('/api/settings', next))
    this.state.set(structuredClone(next));
  }
}
