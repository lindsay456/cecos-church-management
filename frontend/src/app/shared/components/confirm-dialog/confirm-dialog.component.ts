import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmDialog } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-overlay" *ngIf="dialog" (click)="onCancel()">
      <div class="confirm-modal" (click)="$event.stopPropagation()">
        <div class="confirm-icon" [ngClass]="'icon-' + (dialog.type || 'danger')">
          <svg *ngIf="dialog.type !== 'info'" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <svg *ngIf="dialog.type === 'info'" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <h3 class="confirm-title">{{ dialog.title }}</h3>
        <p class="confirm-message">{{ dialog.message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" (click)="onCancel()">{{ dialog.cancelText }}</button>
          <button class="btn-confirm" [ngClass]="'btn-' + (dialog.type || 'danger')" (click)="onConfirm()">{{ dialog.confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex;
      align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px);
    }
    .confirm-modal {
      background: #fff; border-radius: 12px; padding: 28px; width: 100%; max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .confirm-icon {
      width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; margin: 0 auto 16px;
    }
    .icon-danger { background: #FEE2E2; color: #DC2626; }
    .icon-warning { background: #FEF3C7; color: #D97706; }
    .icon-info { background: #DBEAFE; color: #2563EB; }
    .confirm-title { margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #111827; }
    .confirm-message { margin: 0 0 24px; font-size: 14px; color: #6B7280; line-height: 1.5; }
    .confirm-actions { display: flex; gap: 12px; justify-content: center; }
    .btn-cancel {
      padding: 10px 20px; background: #F3F4F6; color: #374151; border: none; border-radius: 8px;
      font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
    }
    .btn-cancel:hover { background: #E5E7EB; }
    .btn-confirm {
      padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px;
      font-weight: 600; cursor: pointer; color: #fff; font-family: inherit;
    }
    .btn-danger { background: #DC2626; }
    .btn-danger:hover { background: #B91C1C; }
    .btn-warning { background: #D97706; }
    .btn-warning:hover { background: #B45309; }
    .btn-info { background: #2563EB; }
    .btn-info:hover { background: #1D4ED8; }
  `]
})
export class ConfirmDialogComponent {
  dialog: ConfirmDialog | null = null;

  constructor(private confirmService: ConfirmService) {
    this.confirmService.dialog$.subscribe(d => this.dialog = d);
  }

  onConfirm() { this.confirmService.resolve(true); }
  onCancel() { this.confirmService.resolve(false); }
}
