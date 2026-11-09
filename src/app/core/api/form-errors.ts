import { AbstractControl } from '@angular/forms';
import { ApiError } from './api.types';

export function applyFieldErrors(form: AbstractControl, e: unknown): void {
  if (!(e instanceof ApiError)) return;
  for (const d of e.details) {
    const control = form.get(d.field);
    control?.setErrors({ ...control.errors, server: d.message });
    control?.markAsTouched();
  }
}
