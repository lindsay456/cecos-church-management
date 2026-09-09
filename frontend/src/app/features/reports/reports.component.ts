import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Rapports</h2>
        <p class="page-subtitle">Generez et consultez les rapports de votre eglise</p>
      </div>
    </div>
    <div class="reports-grid">
      <div class="report-card" *ngFor="let r of reports">
        <div class="report-icon" [style.background]="r.bg" [style.color]="r.color">
          <span class="material-icons">{{ r.icon }}</span>
        </div>
        <h4>{{ r.title }}</h4>
        <p>{{ r.desc }}</p>
        <button class="btn-export" (click)="openReport(r.type)" [disabled]="loading === r.type">
          <span class="material-icons btn-icon-spin" *ngIf="loading === r.type">refresh</span>
          <svg *ngIf="loading !== r.type" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
          {{ loading === r.type ? 'Ouverture...' : 'Consulter le rapport' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px;
      h2 { margin: 0; font-size: 22px; color: var(--gray-900); }
      .page-subtitle { font-size: 13px; color: var(--gray-400); margin: 4px 0 0; }
    }
    .reports-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .report-card {
      background: var(--white); border: 1px solid var(--gray-100); border-radius: var(--radius-lg);
      padding: 28px; text-align: center; box-shadow: var(--shadow-sm); transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
      h4 { margin: 16px 0 6px; font-size: 15px; color: var(--gray-900); }
      p { font-size: 13px; color: var(--gray-500); margin-bottom: 20px; line-height: 1.5; }
    }
    .report-icon {
      width: 56px; height: 56px; border-radius: 14px; display: flex;
      align-items: center; justify-content: center; margin: 0 auto;
      .material-icons { font-size: 28px; }
    }
    .btn-export {
      display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px;
      background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-family);
      transition: all 0.2s; box-shadow: 0 2px 8px rgba(37,99,235,0.2);
      &:hover { background: var(--primary-hover); box-shadow: 0 4px 12px rgba(37,99,235,0.3); transform: translateY(-1px); }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
      svg { flex-shrink: 0; }
    }
    .btn-icon-spin { animation: spin 1s linear infinite; font-size: 16px; }
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

  private reportUrls: Record<string, string> = {};

  constructor(private api: ApiService, private toast: ToastService) {
    const base = (this.api as any).base || '/api/v1';
    this.reportUrls = {
      members: `${base}/reports/members/`,
      financial: `${base}/reports/financial/`,
      donations: `${base}/reports/donations/`,
      attendance: `${base}/reports/attendance/`,
      pastoral: `${base}/reports/pastoral/`,
      audit: `${base}/reports/audit/`,
    };
  }

  openReport(type: string): void {
    if (this.loading) return;
    this.loading = type;
    const url = this.reportUrls[type];
    if (!url) { this.loading = null; return; }
    this.api.openPdfInTab(url, `rapport-${type}.pdf`);
    setTimeout(() => {
      this.loading = null;
      this.toast.success('Rapport ouvert dans un nouvel onglet');
    }, 1000);
  }
}
