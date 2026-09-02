import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Rapports</h2>
    </div>
    <div class="reports-grid">
      <div class="report-card" *ngFor="let r of reports">
        <div class="report-icon" [style.background]="r.bg" [style.color]="r.color">
          <span class="material-icons">{{ r.icon }}</span>
        </div>
        <h4>{{ r.title }}</h4>
        <p>{{ r.desc }}</p>
        <button class="btn-primary" (click)="downloadReport(r.type)" [disabled]="loading === r.type">
          <span class="material-icons" style="font-size:16px" *ngIf="loading === r.type">refresh</span>
          <span class="material-icons" style="font-size:16px" *ngIf="loading !== r.type">download</span>
          {{ loading === r.type ? 'Telechargement...' : 'Telecharger PDF' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 20px; h2 { margin: 0; font-size: 22px; } }
    .reports-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .report-card {
      background: var(--white); border: 1px solid var(--gray-100); border-radius: var(--radius-lg);
      padding: 28px; text-align: center; box-shadow: var(--shadow-sm); transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
      h4 { margin: 16px 0 6px; font-size: 15px; }
      p { font-size: 13px; color: var(--gray-500); margin-bottom: 20px; line-height: 1.5; }
    }
    .report-icon {
      width: 56px; height: 56px; border-radius: 14px; display: flex;
      align-items: center; justify-content: center; margin: 0 auto;
      .material-icons { font-size: 28px; }
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px;
      background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-family); transition: all 0.15s;
      &:hover { background: var(--primary-hover); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
      .material-icons { animation: none; }
      &:disabled .material-icons { animation: spin 1s linear infinite; }
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media (max-width: 1024px) { .reports-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .reports-grid { grid-template-columns: 1fr; } }
  `]
})
export class ReportsComponent {
  loading: string | null = null;

  reports = [
    { type: 'members', title: 'Rapport des Membres', desc: 'Liste complete des membres avec statuts et affectations', icon: 'people', bg: '#EFF6FF', color: '#2563EB' },
    { type: 'financial', title: 'Rapport Financier', desc: 'Resume des recettes, depenses et budget', icon: 'account_balance', bg: '#F0FDF4', color: '#16A34A' },
    { type: 'donations', title: 'Rapport des Dons', desc: 'Historique des dons et recus generes', icon: 'volunteer_activism', bg: '#FEF9C3', color: '#CA8A04' },
    { type: 'attendance', title: 'Rapport de Presence', desc: 'Statistiques de presence par culte', icon: 'check_circle', bg: '#FEF2F2', color: '#DC2626' },
    { type: 'pastoral', title: 'Rapport Pastoral', desc: 'Resume des interactions et suivis pastoraux', icon: 'chat', bg: '#FDF4FF', color: '#9333EA' },
    { type: 'audit', title: 'Rapport d\'Audit', desc: 'Journal complet des actions utilisateur', icon: 'shield', bg: '#FFF7ED', color: '#EA580C' },
  ];

  constructor(private api: ApiService) {}

  downloadReport(type: string): void {
    if (this.loading) return;
    this.loading = type;

    let req$;
    switch (type) {
      case 'members': req$ = this.api.getMembersReport(); break;
      case 'financial': req$ = this.api.getFinancialReport(); break;
      case 'donations': req$ = this.api.getDonationsReport(); break;
      case 'attendance': req$ = this.api.getAttendanceReport(); break;
      case 'pastoral': req$ = this.api.getPastoralReport(); break;
      case 'audit': req$ = this.api.getAuditReport(); break;
      default: this.loading = null; return;
    }

    req$.subscribe({
      next: (blob) => { this.saveBlob(blob, `rapport-${type}.pdf`); this.loading = null; },
      error: () => { alert('Erreur lors du telechargement du rapport'); this.loading = null; }
    });
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
