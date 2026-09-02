import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Journal d'audit</h2>
        <p class="page-subtitle">Historique des actions effectuees dans le systeme</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (input)="filterList()" placeholder="Rechercher..." class="search-input">
      </div>
      <select [(ngModel)]="filterAction" (change)="filterList()">
        <option value="">Toutes les actions</option>
        <option value="CREATE">Creation</option>
        <option value="UPDATE">Modification</option>
        <option value="DELETE">Suppression</option>
        <option value="LOGIN">Connexion</option>
        <option value="LOGOUT">Deconnexion</option>
        <option value="VALIDATE">Validation</option>
        <option value="REJECT">Rejet</option>
        <option value="EXPORT">Export</option>
      </select>
      <select [(ngModel)]="filterDateRange" (change)="filterList()">
        <option value="">Toutes les dates</option>
        <option value="today">Aujourd'hui</option>
        <option value="week">Cette semaine</option>
        <option value="month">Ce mois</option>
      </select>
    </div>

    <div class="table-container" *ngIf="filtered.length">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Utilisateur</th>
            <th>Action</th>
            <th>Objet</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let l of filtered">
            <td><span class="date-text">{{ l.created_at | date:'dd/MM/yyyy' }}</span><span class="time-text">{{ l.created_at | date:'HH:mm' }}</span></td>
            <td>
              <div class="user-cell">
                <div class="avatar-xs">{{ getInitials(l.user_full_name) }}</div>
                <span>{{ l.user_full_name || 'Systeme' }}</span>
              </div>
            </td>
            <td><span class="badge" [ngClass]="getActionBadge(l.action)">{{ formatAction(l.action) }}</span></td>
            <td>{{ l.object_repr || '-' }}</td>
            <td><span class="model-text">{{ l.app_label }}.{{ l.model_name }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <h3>Aucune entree</h3><p>Le journal d'audit est vide pour les filtres selectionnes.</p>
    </div>

    <div class="loading-state" *ngIf="loading">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 20px;
      h2 { margin: 0; font-size: 22px; color: var(--gray-900); }
      .page-subtitle { font-size: 13px; color: var(--gray-400); margin: 2px 0 0; }
    }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 8px; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 10px 14px;
      svg { flex-shrink: 0; }
      .search-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: var(--font-family); }
    }
    select { padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; background: var(--white); font-family: var(--font-family); }
    .table-container { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--gray-50); padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 16px; border-top: 1px solid var(--gray-100); font-size: 14px; }
    .date-text { display: block; font-size: 13px; color: var(--gray-700); }
    .time-text { display: block; font-size: 12px; color: var(--gray-400); }
    .user-cell { display: flex; align-items: center; gap: 8px; }
    .avatar-xs { width: 28px; height: 28px; border-radius: 6px; background: var(--gray-300); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .badge-create { background: #DCFCE7; color: #166534; }
    .badge-update { background: #DBEAFE; color: #1E40AF; }
    .badge-delete { background: #FEE2E2; color: #991B1B; }
    .badge-login { background: #E0E7FF; color: #3730A3; }
    .badge-logout { background: var(--gray-100); color: var(--gray-600); }
    .badge-validate { background: #D1FAE5; color: #065F46; }
    .badge-reject { background: #FEE2E2; color: #991B1B; }
    .badge-export { background: #FEF3C7; color: #92400E; }
    .badge-other { background: var(--gray-100); color: var(--gray-600); }
    .model-text { font-size: 12px; color: var(--gray-400); font-family: monospace; }
    .empty-state, .loading-state { text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--gray-100); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) {
      .filters-bar { flex-direction: column; }
    }
  `]
})
export class AuditComponent implements OnInit {
  logs: any[] = [];
  filtered: any[] = [];
  search = '';
  filterAction = '';
  filterDateRange = '';
  loading = true;

  private actionLabels: Record<string, string> = {
    CREATE: 'Creation', UPDATE: 'Modification', DELETE: 'Suppression', ARCHIVE: 'Archivage',
    LOGIN: 'Connexion', LOGIN_FAILED: 'Echec connexion', LOGOUT: 'Deconnexion',
    PASSWORD_CHANGE: 'Changement MDP', TRANSFER: 'Transfert', VALIDATE: 'Validation',
    REJECT: 'Rejet', CANCEL: 'Annulation', CORRECT: 'Correction', EXPORT: 'Export',
    DOWNLOAD: 'Telechargement', VIEW: 'Consultation', ROLE_CHANGE: 'Changement role',
    RECEIPT_GENERATED: 'Recu genere',
  };

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getAuditLogs().subscribe({
      next: (res: any) => { this.logs = res?.results ?? res ?? []; this.filterList(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filterList() {
    const q = this.search.toLowerCase();
    const now = new Date();
    this.filtered = this.logs.filter(l => {
      if (q && !l.user_full_name?.toLowerCase().includes(q) && !l.object_repr?.toLowerCase().includes(q) && !l.action?.toLowerCase().includes(q)) return false;
      if (this.filterAction && l.action !== this.filterAction) return false;
      if (this.filterDateRange) {
        const d = new Date(l.created_at);
        if (this.filterDateRange === 'today' && d.toDateString() !== now.toDateString()) return false;
        if (this.filterDateRange === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (d < weekAgo) return false;
        }
        if (this.filterDateRange === 'month') {
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }

  formatAction(action: string): string { return this.actionLabels[action] || action; }
  getActionBadge(action: string): string {
    const a = (action || '').toLowerCase();
    if (a === 'create') return 'badge-create';
    if (a === 'update') return 'badge-update';
    if (a === 'delete') return 'badge-delete';
    if (a === 'login') return 'badge-login';
    if (a === 'logout') return 'badge-logout';
    if (a === 'validate') return 'badge-validate';
    if (a === 'reject') return 'badge-reject';
    if (a === 'export') return 'badge-export';
    return 'badge-other';
  }
  getInitials(name: string): string { return (name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2); }
}
