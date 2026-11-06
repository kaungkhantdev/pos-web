export type Currency = 'THB' | 'USD' | 'EUR';
export type PaperSize = '80mm' | '58mm';

export interface ShopSettings {
  shop: { name: string; address: string; phone: string; currency: Currency };
  tax: { rate: number; taxId: string; inclusive: boolean };
  receipt: { header: string; footer: string };
  payments: { cash: boolean; card: boolean; qr: boolean };
  printer: {
    receipt: string;
    kitchen: string; // 'none' = KDS only
    paper: PaperSize;
    copies: number;
    autoKitchen: boolean;
    autoReceipt: boolean;
    cashDrawer: boolean;
  };
}
