import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmService } from '../notify/confirm.service';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** asks before leaving a page with unsaved form changes */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (page) =>
  !page.hasUnsavedChanges() ||
  inject(ConfirmService).ask({
    title: 'Leave without saving?',
    message: 'Your changes on this page will be lost.',
    confirmText: 'Leave',
    cancelText: 'Stay',
    confirmIcon: 'hgi-logout-03',
    tone: 'warning',
  });
