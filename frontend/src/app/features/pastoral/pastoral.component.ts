import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-pastoral',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Suivi pastoral</h2>
        <p class="page-subtitle">Gerez les suivis et accompagnements des membres</p>
      </div>
      <button class="btn-primary" (click)="openForm()">+ Nouveau suivi</button>
    </div>

    <div class="stats-row">
      <div class="stat-card" *ngFor="let s of statCards">
        <span class="stat-value">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
        <span class="stat-dot" [style.background]="s.color"></span>
      </div>
    </div>

    <div class="filters-bar">
      <div class="tabs">
        <button [class.active]="activeTab === 'all'" (click)="activeTab = 'all'; filterList()">Tous</button>
        <button [class.active]="activeTab === 'OPEN'" (click)="activeTab = 'OPEN'; filterList()">Ouverts</button>
        <button [class.active]="activeTab === 'IN_PROGRESS'" (click)="activeTab = 'IN_PROGRESS'; filterList()">En cours</button>
        <button [class.active]="activeTab === 'CLOSED'" (click)="activeTab = 'CLOSED'; filterList()">Termines</button>
      </div>
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (input)="filterList()" placeholder="Rechercher..." class="search-input">
      </div>
    </div>

    <div class="cards-grid" *ngIf="filtered.length">
      <div class="pastoral-card" *ngFor="let f of filtered">
        <div class="card-header-row">
          <div class="avatar" [style.background]="getAvatarColor(f.action_type)">{{ getInitials(f.member_name) }}</div>
          <div class="card-info">
            <h4>{{ f.member_name }}</h4>
            <p class="reason">{{ f.reason }}</p>
          </div>
          <span class="badge" [ngClass]="getStatusClass(f.status)">{{ getStatusLabel(f.status) }}</span>
        </div>
        <div class="card-details">
          <div class="detail-row"><svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><span>{{ getTypeLabel(f.action_type) }}</span></div>
          <div class="detail-row"><svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg><span>{{ f.action_date | date:'dd/MM/yyyy' }}</span></div>
          <div class="detail-row" *ngIf="f.next_action_date"><svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg><span>Prochaine: {{ f.next_action_date | date:'dd/MM/yyyy' }}</span></div>
          <div class="detail-row"><svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/></svg><span>{{ f.assigned_to_name || 'Non assigne' }}</span></div>
        </div>
        <p class="card-desc" *ngIf="f.details">{{ f.details }}</p>
        <div class="card-actions">
          <button class="btn-icon" title="Modifier" (click)="openForm(f)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
          <button class="btn-icon" title="Terminer" *ngIf="f.status !== 'CLOSED'" (click)="closeFollowup(f)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </button>
          <button class="btn-icon btn-danger" title="Supprimer" (click)="confirmDelete(f)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <h3>Aucun suivi pastoral</h3><p>Commencez par creer un suivi.</p>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Modifier le suivi' : 'Nouveau suivi pastoral' }}</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-group"><label>Membre *</label>
            <select [(ngModel)]="form.member" name="member" required>
              <option value="">Selectionner un membre...</option>
              <option *ngFor="let m of members" [value]="m.id">{{ m.first_name }} {{ m.last_name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Type d'action *</label>
              <select [(ngModel)]="form.action_type" name="action_type" required>
                <option value="VISIT">Visite</option>
                <option value="PHONE_CALL">Appel telephonique</option>
                <option value="COUNSELING">Conseil</option>
                <option value="PRAYER">Priere</option>
                <option value="FAMILY_SUPPORT">Soutien familial</option>
                <option value="SOCIAL_ASSISTANCE">Assistance sociale</option>
                <option value="SPIRITUAL_SUPPORT">Soutien spirituel</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div class="form-group"><label>Statut</label>
              <select [(ngModel)]="form.status" name="status">
                <option value="OPEN">Ouvert</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="PENDING">En attente</option>
                <option value="CLOSED">Termine</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Motif *</label><input [(ngModel)]="form.reason" name="reason" required placeholder="Ex: Suivi familial, Accompagnement..."></div>
          <div class="form-row">
            <div class="form-group"><label>Date de l'action *</label><input type="date" [(ngModel)]="form.action_date" name="action_date" required></div>
            <div class="form-group"><label>Prochaine action</label><input type="date" [(ngModel)]="form.next_action_date" name="next_action_date"></div>
          </div>
          <div class="form-group"><label>Details</label><textarea [(ngModel)]="form.details" name="details" rows="3" placeholder="Description du suivi..."></textarea></div>
          <div class="form-group"><label>Notes internes</label><textarea [(ngModel)]="form.notes" name="notes" rows="2" placeholder="Notes privees..."></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ editing ? 'Enregistrer' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div class="modal-overlay" *ngIf="deleting" (click)="deleting = null">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>Confirmer</h3><button class="btn-close" (click)="deleting = null">&times;</button></div>
        <p>Voulez-vous supprimer ce suivi pastoral ?</p>
        <div class="form-actions">
          <button class="btn-secondary" (click)="deleting = null">Annuler</button>
          <button class="btn-danger" (click)="delete()">Supprimer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 22px; color: var(--gray-900); }
      .page-subtitle { font-size: 13px; color: var(--gray-400); margin: 2px 0 0; }
    }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: var(--white); border-radius: var(--radius); padding: 16px; border: 1px solid var(--gray-100); position: relative; overflow: hidden;
      .stat-value { display: block; font-size: 24px; font-weight: 800; color: var(--gray-900); }
      .stat-label { display: block; font-size: 12px; color: var(--gray-400); margin-top: 2px; }
      .stat-dot { position: absolute; top: 16px; right: 16px; width: 8px; height: 8px; border-radius: 50%; }
    }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
    .tabs { display: flex; background: var(--gray-100); border-radius: var(--radius-sm); padding: 3px;
      button { padding: 8px 16px; border: none; background: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--gray-500); font-family: var(--font-family);
        &.active { background: var(--white); color: var(--primary); box-shadow: var(--shadow-sm); }
      }
    }
    .search-box { flex: 1; display: flex; align-items: center; gap: 8px; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 10px 14px;
      svg { flex-shrink: 0; }
      .search-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: var(--font-family); }
    }

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
    .pastoral-card { background: var(--white); border-radius: var(--radius); padding: 20px; border: 1px solid var(--gray-100); box-shadow: var(--shadow-sm); }
    .card-header-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .avatar { width: 40px; height: 40px; border-radius: 10px; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .card-info { flex: 1; min-width: 0;
      h4 { margin: 0; font-size: 15px; color: var(--gray-900); }
      .reason { margin: 2px 0 0; font-size: 13px; color: var(--gray-500); }
    }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .badge-open { background: #DBEAFE; color: #1E40AF; }
    .badge-in-progress { background: #FEF3C7; color: #92400E; }
    .badge-pending { background: #E0E7FF; color: #3730A3; }
    .badge-closed { background: #DCFCE7; color: #166534; }
    .badge-archived { background: var(--gray-100); color: var(--gray-500); }
    .card-details { margin-bottom: 12px; }
    .detail-row { display: flex; align-items: center; gap: 6px; padding: 3px 0; font-size: 13px; color: var(--gray-500); }
    .card-desc { font-size: 13px; color: var(--gray-600); background: var(--gray-50); padding: 10px; border-radius: 8px; margin-bottom: 12px; white-space: pre-wrap; }
    .card-actions { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid var(--gray-100); }

    .btn-primary { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: var(--primary-hover); } &:disabled { opacity: 0.6; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); }
    .btn-danger { padding: 10px 20px; background: var(--red); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-family); }
    .btn-outline-sm { padding: 6px 14px; background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-family: var(--font-family);
      &:hover { background: var(--gray-50); }
    }
    .btn-danger-sm { padding: 6px 14px; background: var(--white); color: var(--red); border: 1px solid #FECACA; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-family: var(--font-family);
      &:hover { background: #FEF2F2; }
    }
    .btn-icon { width: 32px; height: 32px; border: none; background: var(--gray-50); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray-500);
      &:hover { background: var(--gray-100); color: var(--primary); }
    }
    .btn-icon.btn-danger { background: #FEF2F2; color: var(--red); &:hover { background: #FEE2E2; } }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-400); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius); padding: 28px; width: 100%; max-width: 580px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-sm { max-width: 400px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h3 { margin: 0; font-size: 20px; } }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .form-row { display: flex; gap: 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-100); }
    .empty-state { text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .stats-row { grid-template-columns: 1fr 1fr; }
      .filters-bar { flex-direction: column; }
      .cards-grid { grid-template-columns: 1fr; }
      .form-row { flex-direction: column; }
    }
  `]
})
export class PastoralComponent implements OnInit {
  followups: any[] = [];
  filtered: any[] = [];
  members: any[] = [];
  search = '';
  activeTab = 'all';
  loading = false;
  showForm = false;
  saving = false;
  editing: any = null;
  deleting: any = null;
  form: any = this.getEmptyForm();
  statCards = [
    { label: 'Total', value: 0, color: '#2563EB' },
    { label: 'Ouverts', value: 0, color: '#D97706' },
    { label: 'En cours', value: 0, color: '#7C3AED' },
    { label: 'Termines', value: 0, color: '#059669' },
  ];

  private typeLabels: Record<string, string> = {
    VISIT: 'Visite', PHONE_CALL: 'Appel', COUNSELING: 'Conseil', PRAYER: 'Priere',
    FAMILY_SUPPORT: 'Soutien familial', SOCIAL_ASSISTANCE: 'Assistance sociale', SPIRITUAL_SUPPORT: 'Soutien spirituel', OTHER: 'Autre',
  };
  private statusLabels: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', PENDING: 'En attente', CLOSED: 'Termine', ARCHIVED: 'Archive' };
  private avatarColors: Record<string, string> = {
    VISIT: '#059669', PHONE_CALL: '#2563EB', COUNSELING: '#7C3AED', PRAYER: '#D97706',
    FAMILY_SUPPORT: '#EC4899', SOCIAL_ASSISTANCE: '#F97316', SPIRITUAL_SUPPORT: '#8B5CF6', OTHER: '#6B7280',
  };

  constructor(private api: ApiService, private toast: ToastService) {}
  ngOnInit() {
    this.load();
    this.api.getMembers().subscribe({ next: (res: any) => this.members = res.results || res || [] });
  }

  getEmptyForm() {
    return { member: '', action_type: 'VISIT', action_date: new Date().toISOString().substring(0, 10), next_action_date: '', reason: '', status: 'OPEN', details: '', notes: '', church: '' };
  }

  load() {
    this.loading = true;
    this.api.getPastoralFollowups().subscribe({
      next: (res: any) => { this.followups = res.results || res || []; this.computeStats(); this.filterList(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  computeStats() {
    this.statCards[0].value = this.followups.length;
    this.statCards[1].value = this.followups.filter(f => f.status === 'OPEN').length;
    this.statCards[2].value = this.followups.filter(f => f.status === 'IN_PROGRESS').length;
    this.statCards[3].value = this.followups.filter(f => f.status === 'CLOSED').length;
  }

  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.followups.filter(f =>
      (this.activeTab === 'all' || f.status === this.activeTab) &&
      (!q || f.member_name?.toLowerCase().includes(q) || f.reason?.toLowerCase().includes(q))
    );
  }

  getTypeLabel(t: string): string { return this.typeLabels[t] || t; }
  getStatusLabel(s: string): string { return this.statusLabels[s] || s; }
  getStatusClass(s: string): string { return 'badge-' + (s || 'open').toLowerCase().replace('_', '-'); }
  getInitials(name: string): string { return (name || '').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2); }
  getAvatarColor(type: string): string { return this.avatarColors[type] || '#6B7280'; }

  openForm(f?: any) {
    this.editing = f || null;
    this.form = f ? { ...f, next_action_date: f.next_action_date || '' } : this.getEmptyForm();
    this.showForm = true;
  }

  save() {
    this.saving = true;
    const obs = this.editing ? this.api.updatePastoralFollowup(this.editing.id, this.form) : this.api.createPastoralFollowup(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.editing = null; this.saving = false; this.load(); this.toast.success('Suivi pastoral enregistre'); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  closeFollowup(f: any) {
    this.api.updatePastoralFollowup(f.id, { status: 'CLOSED' }).subscribe({ next: () => { this.load(); this.toast.success('Suivi termine'); }, error: (err) => this.toast.error(err.error?.detail || 'Erreur') });
  }

  confirmDelete(f: any) { this.deleting = f; }
  delete() {
    if (!this.deleting) return;
    this.api.deletePastoralFollowup(this.deleting.id).subscribe({ next: () => { this.deleting = null; this.load(); this.toast.success('Suivi supprime'); }, error: (err) => this.toast.error(err.error?.detail || 'Erreur') });
  }
}
