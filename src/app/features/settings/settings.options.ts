import { Currency, PaperSize } from '../../core/settings/settings.model';

// TODO: printers from GET /api/printers (what the print bridge can see)
export const RECEIPT_PRINTERS = [
  { id: 'epson-t88', label: 'EPSON TM-T88VI (Counter)' },
  { id: 'star-tsp143', label: 'Star TSP143 (Front)' },
  { id: 'pdf', label: 'Save as PDF' },
];

export const KITCHEN_PRINTERS = [
  { id: 'epson-u220', label: 'EPSON TM-U220 (Kitchen)' },
  { id: 'bar', label: 'Bar Printer' },
  { id: 'none', label: 'None (use KDS only)' },
];

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'THB', label: 'THB (฿)', symbol: '฿' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
];

export const PAPER_SIZES: { value: PaperSize; label: string; chars: number }[] = [
  { value: '80mm', label: '80 mm', chars: 48 },
  { value: '58mm', label: '58 mm', chars: 32 },
];

export const PAYMENT_OPTIONS = [
  { key: 'cash', label: 'Cash', icon: 'hgi-money-03' },
  { key: 'card', label: 'Credit / Debit Card', icon: 'hgi-credit-card' },
  { key: 'qr', label: 'QR / PromptPay', icon: 'hgi-qr-code' },
] as const;

export const PRINT_TOGGLES = [
  {
    key: 'autoKitchen',
    icon: 'hgi-fire',
    label: 'Auto-print kitchen ticket',
    hint: 'Send a ticket to the kitchen printer on order confirm',
  },
  {
    key: 'autoReceipt',
    icon: 'hgi-receipt-dollar',
    label: 'Auto-print receipt on payment',
    hint: 'Print a customer receipt when payment completes',
  },
  {
    key: 'cashDrawer',
    icon: 'hgi-money-01',
    label: 'Open cash drawer on cash payment',
    hint: 'Trigger the connected drawer via the printer',
  },
] as const;

/** sample order for the receipt preview */
export const SAMPLE_LINES = [
  { name: 'Pad Thai', qty: 2, price: 110 },
  { name: 'Iced Coffee', qty: 1, price: 55 },
];
