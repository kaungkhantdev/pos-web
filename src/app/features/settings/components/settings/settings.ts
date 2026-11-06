import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  CURRENCIES,
  KITCHEN_PRINTERS,
  PAPER_SIZES,
  PAYMENT_OPTIONS,
  PRINT_TOGGLES,
  RECEIPT_PRINTERS,
  SAMPLE_LINES,
} from '../../settings.options';
import { HeaderTools } from '../../../../shared/components/header-tools/header-tools';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ToastService } from '../../../../core/notify/toast.service';
import { SettingsService } from '../../../../core/settings/settings.service';
import { Currency, PaperSize, ShopSettings } from '../../../../core/settings/settings.model';

const PHONE = /^0\d{1,2}-?\d{3}-?\d{3,4}$/;
const TAX_ID = /^\d{13}$/; // Thai tax ID
const round2 = (n: number) => Math.round(n * 100) / 100;

/** at least one payment method must stay on */
const atLeastOne = (g: AbstractControl): ValidationErrors | null =>
  Object.values((g as FormGroup).controls).some((c) => c.value) ? null : { noneSelected: true };

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, DecimalPipe, NgTemplateOutlet, HeaderTools],
  templateUrl: './settings.html',
  host: {
    class: 'block',
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class Settings implements HasUnsavedChanges {
  private fb = inject(FormBuilder).nonNullable;
  private toast = inject(ToastService);
  private store = inject(SettingsService);
  private host: ElementRef<HTMLElement> = inject(ElementRef);

  currencies = CURRENCIES;
  receiptPrinters = RECEIPT_PRINTERS;
  kitchenPrinters = KITCHEN_PRINTERS;
  paperSizes = PAPER_SIZES;
  paymentOptions = PAYMENT_OPTIONS;
  printToggles = PRINT_TOGGLES;

  saving = signal(false);

  form = this.fb.group({
    shop: this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      address: ['', Validators.maxLength(160)],
      phone: ['', Validators.pattern(PHONE)],
      currency: this.fb.control<Currency>('THB'),
    }),
    tax: this.fb.group({
      rate: this.fb.control<number | null>(7, [
        Validators.required,
        Validators.min(0),
        Validators.max(30),
      ]),
      taxId: ['', Validators.pattern(TAX_ID)],
      inclusive: [false],
    }),
    receipt: this.fb.group({
      header: ['', Validators.maxLength(48)],
      footer: ['', Validators.maxLength(48)],
    }),
    payments: this.fb.group({ cash: [true], card: [true], qr: [true] }, { validators: atLeastOne }),
    printer: this.fb.group({
      receipt: [''],
      kitchen: [''],
      paper: this.fb.control<PaperSize>('80mm'),
      copies: this.fb.control<number | null>(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(5),
      ]),
      autoKitchen: [true],
      autoReceipt: [true],
      cashDrawer: [true],
    }),
  });

  /** re-runs computeds whenever the form changes */
  private changes = toSignal(this.form.valueChanges, { initialValue: null });
  dirty = computed(() => (this.changes(), this.form.dirty));

  constructor() {
    // no kitchen printer → nothing to auto-print
    this.form.controls.printer.controls.kitchen.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((id) => this.syncKitchenToggle(id));

    this.load();
  }

  private load() {
    const s = this.store.settings();
    this.form.reset(s);
    this.syncKitchenToggle(s.printer.kitchen);
  }

  private syncKitchenToggle(kitchenId: string) {
    const c = this.form.controls.printer.controls.autoKitchen;
    kitchenId === 'none' ? c.disable({ emitEvent: false }) : c.enable({ emitEvent: false });
  }

  // ---------- Field helpers ----------
  invalid(c: AbstractControl) {
    return c.invalid && (c.touched || c.dirty);
  }

  /** shared input classes, red border when invalid */
  field(c: AbstractControl) {
    return (
      'w-full h-10 px-4 rounded-xl bg-white border focus:outline-none text-sm transition-colors ' +
      (this.invalid(c) ? 'border-red-500' : 'border-gray-200 focus:border-[#00c066]')
    );
  }

  // ---------- Receipt preview ----------
  preview = computed(() => {
    this.changes();
    const v = this.form.getRawValue();
    const rate = v.tax.rate ?? 0;
    const subtotal = SAMPLE_LINES.reduce((s, l) => s + l.price * l.qty, 0);
    const tax = v.tax.inclusive
      ? round2((subtotal * rate) / (100 + rate))
      : round2((subtotal * rate) / 100);
    const paper = PAPER_SIZES.find((p) => p.value === v.printer.paper)!;
    return {
      v,
      rate,
      lines: SAMPLE_LINES,
      subtotal,
      tax,
      total: v.tax.inclusive ? subtotal : round2(subtotal + tax),
      symbol: CURRENCIES.find((c) => c.value === v.shop.currency)?.symbol ?? '',
      width: paper.value === '80mm' ? 'w-[280px]' : 'w-[210px]',
      chars: paper.chars,
    };
  });

  // ---------- Actions ----------
  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Check the form', 'Some settings need fixing before they can be saved.');
      this.host.nativeElement
        .querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid')
        ?.focus();
      return;
    }
    this.saving.set(true);
    try {
      const value = this.form.getRawValue() as ShopSettings; // valid, so no nulls left
      await this.store.save(value);
      this.form.reset(value); // now clean
      this.syncKitchenToggle(value.printer.kitchen);
      this.toast.success('Settings saved', 'Your changes have been saved.');
    } catch {
      this.toast.error('Not saved', 'Something went wrong. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  /** back to the last saved values (like the kit's Reset) */
  revert() {
    this.load();
  }

  testPrint() {
    const id = this.form.controls.printer.controls.receipt.value;
    const name = RECEIPT_PRINTERS.find((p) => p.id === id)?.label ?? 'the receipt printer';
    // TODO: POST /api/printers/{id}/test
    this.toast.info('Test page sent', `Check ${name} for the test page.`);
  }

  // ---------- Leaving with changes ----------
  hasUnsavedChanges() {
    return this.form.dirty;
  }

  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.form.dirty) e.preventDefault();
  }
}
