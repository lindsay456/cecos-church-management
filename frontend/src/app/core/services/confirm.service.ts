import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmDialog {
  id: number;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private dialog = new BehaviorSubject<ConfirmDialog | null>(null);
  dialog$ = this.dialog.asObservable();
  private resolveFn: ((result: boolean) => void) | null = null;
  private nextId = 0;

  confirm(title: string, message: string, options?: { confirmText?: string; cancelText?: string; type?: ConfirmDialog['type'] }): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
      this.dialog.next({
        id: this.nextId++,
        title,
        message,
        confirmText: options?.confirmText || 'Confirmer',
        cancelText: options?.cancelText || 'Annuler',
        type: options?.type || 'danger',
      });
    });
  }

  resolve(result: boolean) {
    if (this.resolveFn) {
      this.resolveFn(result);
      this.resolveFn = null;
    }
    this.dialog.next(null);
  }
}
