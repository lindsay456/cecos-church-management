import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-visitors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Visiteurs</h2>
        <p class="page-subtitle">Gerez les visites et le suivi des visiteurs</p>
      </div>
      <button class="btn-primary" (click)="openForm()">+ Nouveau visiteur</button>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (input)="filterList()" placeholder="Rechercher un visiteur..." class="search-input">
      </div>
      <select [(ngModel)]="filterStatus" (change)="filterList()">
        <option value="">Tous les statuts</option>
        <option value="NEW">Nouveau</option>
        <option value="TO_CONTACT">A contacter</option>
        <option value="CONTACTED">Contacte</option>
        <option value="RETURNED">Revenu</option>
        <option value="BECAME_MEMBER">Devenu membre</option>
        <option value="DO_NOT_CONTACT">Ne pas contacter</option>
      </select>
      <div class="stats-mini">
        <span>{{ filtered.length }} visiteur(s)</span>
      </div>
    </div>

    <div class="table-container" *ngIf="filtered.length">
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Telephone</th>
            <th>Date visite</th>
            <th>Invite par</th>
            <th>Suivi</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of filtered" (click)="viewDetail(v)" class="clickable-row">
            <td>
              <div class="visitor-cell">
                <div class="avatar-sm" [style.background]="getAvatarColor(v.follow_up_status)">{{ getInitials(v) }}</div>
                <div>
                  <strong>{{ v.full_name || (v.first_name + ' ' + v.last_name) }}</strong>
                  <span class="email-text" *ngIf="v.email">{{ v.email }}</span>
                </div>
              </div>
            </td>
            <td>{{ v.phone || '-' }}</td>
            <td>{{ v.first_visit_date | date:'dd/MM/yyyy' }}</td>
            <td>{{ v.invited_by_name || '-' }}</td>
            <td>
              <select class="status-select" [ngClass]="getStatusClass(v.follow_up_status)" [value]="v.follow_up_status" (change)="updateStatus(v, $event); $event.stopPropagation()">
                <option value="NEW">Nouveau</option>
                <option value="TO_CONTACT">A contacter</option>
                <option value="CONTACTED">Contacte</option>
                <option value="RETURNED">Revenu</option>
                <option value="BECAME_MEMBER">Devenu membre</option>
                <option value="DO_NOT_CONTACT">Ne pas contacter</option>
                <option value="ARCHIVED">Archive</option>
              </select>
            </td>
            <td class="actions" (click)="$event.stopPropagation()">
              <button class="btn-icon" title="Modifier" (click)="openForm(v)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="btn-icon btn-danger" title="Supprimer" (click)="confirmDelete(v)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <h3>Aucun visiteur</h3><p>Enregistrez un nouveau visiteur pour commencer.</p>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Modifier le visiteur' : 'Nouveau visiteur' }}</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group"><label>Prenom</label><input [(ngModel)]="form.first_name" name="first_name" placeholder="Prenom"></div>
            <div class="form-group"><label>Nom</label><input [(ngModel)]="form.last_name" name="last_name" placeholder="Nom"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Telephone</label><input [(ngModel)]="form.phone" name="phone" placeholder="+237 6XX XXX XXX"></div>
            <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="form.email" name="email" placeholder="prenom.nom@gmail.com"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Date de visite *</label><input type="date" [(ngModel)]="form.first_visit_date" name="first_visit_date" required></div>
            <div class="form-group"><label>Eglise visitee *</label>
              <select [(ngModel)]="form.church" name="church" required>
                <option value="">Selectionner...</option>
                <option *ngFor="let e of entities" [value]="e.id">{{ e.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Invite par</label>
            <select [(ngModel)]="form.invited_by" name="invited_by">
              <option value="">Aucun</option>
              <option *ngFor="let m of members" [value]="m.id">{{ m.first_name }} {{ m.last_name }}</option>
            </select>
          </div>
          <div class="form-group"><label>Motif de visite</label><input [(ngModel)]="form.reason_for_visit" name="reason_for_visit" placeholder="Ex: Premiere visite, invitation..."></div>
          <div class="form-row">
            <div class="form-group checkbox-group">
              <label><input type="checkbox" [(ngModel)]="form.wants_follow_up" name="wants_follow_up"> Souhaite un suivi</label>
            </div>
            <div class="form-group checkbox-group">
              <label><input type="checkbox" [(ngModel)]="form.consent_contact" name="consent_contact"> Consentement de contact</label>
            </div>
          </div>
          <div class="form-group"><label>Notes</label><textarea [(ngModel)]="form.notes" name="notes" rows="3" placeholder="Observations..."></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ editing ? 'Enregistrer' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal-overlay" *ngIf="detailItem" (click)="detailItem = null">
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ detailItem.full_name || detailItem.first_name + ' ' + detailItem.last_name }}</h3>
          <button class="btn-close" (click)="detailItem = null">&times;</button>
        </div>
        <div class="detail-grid">
          <div class="detail-section">
            <h4>Informations</h4>
            <div class="detail-row"><span class="detail-label">Telephone</span><span>{{ detailItem.phone || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Email</span><span>{{ detailItem.email || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Eglise</span><span>{{ detailItem.church_name }}</span></div>
            <div class="detail-row"><span class="detail-label">Invite par</span><span>{{ detailItem.invited_by_name || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Date visite</span><span>{{ detailItem.first_visit_date | date:'dd/MM/yyyy' }}</span></div>
          </div>
          <div class="detail-section">
            <h4>Suivi</h4>
            <div class="detail-row"><span class="detail-label">Statut</span><span class="badge" [ngClass]="getStatusClass(detailItem.follow_up_status)">{{ getStatusLabel(detailItem.follow_up_status) }}</span></div>
            <div class="detail-row"><span class="detail-label">Souhaite un suivi</span><span>{{ detailItem.wants_follow_up ? 'Oui' : 'Non' }}</span></div>
            <div class="detail-row"><span class="detail-label">Consentement</span><span>{{ detailItem.consent_contact ? 'Oui' : 'Non' }}</span></div>
            <div class="detail-row"><span class="detail-label">Motif</span><span>{{ detailItem.reason_for_visit || '-' }}</span></div>
            <div class="detail-obs" *ngIf="detailItem.notes">
              <span class="detail-label">Notes</span>
              <p>{{ detailItem.notes }}</p>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" (click)="detailItem = null">Fermer</button>
          <button class="btn-primary" (click)="detailItem = null; openForm(detailItem)">Modifier</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div class="modal-overlay" *ngIf="deleting" (click)="deleting = null">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>Confirmer</h3><button class="btn-close" (click)="deleting = null">&times;</button></div>
        <p>Voulez-vous supprimer <strong>{{ deleting.full_name || deleting.first_name + ' ' + deleting.last_name }}</strong> ?</p>
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
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 8px; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 10px 14px;
      svg { flex-shrink: 0; }
      .search-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: var(--font-family); }
    }
    select { padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; background: var(--white); font-family: var(--font-family); }
    .stats-mini { font-size: 13px; color: var(--gray-500); padding: 0 8px; white-space: nowrap; }

    .table-container { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--gray-50); padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 16px; border-top: 1px solid var(--gray-100); font-size: 14px; }
    .clickable-row { cursor: pointer; &:hover { background: var(--gray-50); } }
    .actions { display: flex; gap: 4px; }
    .visitor-cell { display: flex; align-items: center; gap: 10px; }
    .avatar-sm { width: 32px; height: 32px; border-radius: 8px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .email-text { display: block; font-size: 12px; color: var(--gray-400); }
    .status-select { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; border: 1px solid var(--gray-200); cursor: pointer; font-family: var(--font-family);
      &.status-new { background: #DBEAFE; color: #1E40AF; border-color: #BFDBFE; }
      &.status-to-contact { background: #FEF3C7; color: #92400E; border-color: #FDE68A; }
      &.status-contacted { background: #E0E7FF; color: #3730A3; border-color: #C7D2FE; }
      &.status-returned { background: #DCFCE7; color: #166534; border-color: #BBF7D0; }
      &.status-became-member { background: #D1FAE5; color: #065F46; border-color: #A7F3D0; }
      &.status-do-not-contact { background: var(--gray-100); color: var(--gray-600); border-color: var(--gray-200); }
      &.status-archived { background: var(--gray-100); color: var(--gray-500); border-color: var(--gray-200); }
    }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }

    .btn-primary { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: var(--primary-hover); } &:disabled { opacity: 0.6; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); }
    .btn-danger { padding: 10px 20px; background: var(--red); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-family); }
    .btn-icon { width: 32px; height: 32px; border: none; background: var(--gray-50); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray-500);
      &:hover { background: var(--gray-100); color: var(--primary); }
    }
    .btn-icon.btn-danger { background: #FEF2F2; color: var(--red); &:hover { background: #FEE2E2; } }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-400); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius); padding: 28px; width: 100%; max-width: 580px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-lg { max-width: 700px; }
    .modal-sm { max-width: 400px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h3 { margin: 0; font-size: 20px; } }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .checkbox-group { label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500; input[type="checkbox"] { width: auto; } } }
    .form-row { display: flex; gap: 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-100); }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 8px; }
    .detail-section h4 { font-size: 14px; color: var(--gray-500); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--gray-100); }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid var(--gray-50);
      .detail-label { color: var(--gray-500); font-size: 13px; }
    }
    .detail-obs { margin-top: 12px; .detail-label { display: block; color: var(--gray-500); font-size: 13px; margin-bottom: 4px; }
      p { margin: 0; font-size: 14px; color: var(--gray-700); white-space: pre-wrap; }
    }

    .empty-state { text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .filters-bar { flex-direction: column; }
      .form-row { flex-direction: column; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class VisitorsComponent implements OnInit {
  visitors: any[] = [];
  filtered: any[] = [];
  entities: any[] = [];
  members: any[] = [];
  search = '';
  filterStatus = '';
  loading = false;
  showForm = false;
  saving = false;
  editing: any = null;
  deleting: any = null;
  detailItem: any = null;
  form: any = this.getEmptyForm();

  private statusLabels: Record<string, string> = {
    NEW: 'Nouveau', TO_CONTACT: 'A contacter', CONTACTED: 'Contacte', RETURNED: 'Revenu',
    BECAME_MEMBER: 'Devenu membre', DO_NOT_CONTACT: 'Ne pas contacter', ARCHIVED: 'Archive',
  };

  constructor(private api: ApiService, private toast: ToastService) {}
  ngOnInit() {
    this.load();
    this.api.getEntities().subscribe({ next: (res: any) => this.entities = res.results || res || [] });
    this.api.getMembers().subscribe({ next: (res: any) => this.members = res.results || res || [] });
  }

  getEmptyForm() {
    return { first_name: '', last_name: '', phone: '', email: '', church: '', first_visit_date: new Date().toISOString().substring(0, 10), invited_by: '', reason_for_visit: '', wants_follow_up: false, consent_contact: false, notes: '', follow_up_status: 'NEW' };
  }

  load() {
    this.loading = true;
    this.api.getVisitors().subscribe({
      next: (res: any) => { this.visitors = res.results || res || []; this.filterList(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.visitors.filter(v =>
      (!q || v.first_name?.toLowerCase().includes(q) || v.last_name?.toLowerCase().includes(q) || v.full_name?.toLowerCase().includes(q) || v.phone?.includes(q) || v.email?.toLowerCase().includes(q)) &&
      (!this.filterStatus || v.follow_up_status === this.filterStatus)
    );
  }

  getInitials(v: any): string { return ((v.first_name?.[0] || '') + (v.last_name?.[0] || '')).toUpperCase(); }
  getAvatarColor(status: string): string {
    const colors: Record<string, string> = { NEW: '#2563EB', TO_CONTACT: '#D97706', CONTACTED: '#4F46E5', RETURNED: '#059669', BECAME_MEMBER: '#047857', DO_NOT_CONTACT: '#6B7280', ARCHIVED: '#9CA3AF' };
    return colors[status] || '#6B7280';
  }
  getStatusLabel(s: string): string { return this.statusLabels[s] || s; }
  getStatusClass(s: string): string { return 'status-' + (s || 'new').toLowerCase().replace('_', '-'); }

  openForm(v?: any) {
    this.editing = v || null;
    this.form = v ? { ...v } : this.getEmptyForm();
    this.showForm = true;
  }

  viewDetail(v: any) { this.detailItem = v; }

  save() {
    this.saving = true;
    const obs = this.editing ? this.api.updateVisitor(this.editing.id, this.form) : this.api.createVisitor(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.editing = null; this.saving = false; this.load(); this.toast.success(this.editing ? 'Visiteur modifie avec succes' : 'Visiteur cree avec succes'); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur lors de la sauvegarde'); }
    });
  }

  updateStatus(v: any, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    this.api.updateVisitor(v.id, { follow_up_status: newStatus }).subscribe({
      next: () => { v.follow_up_status = newStatus; this.toast.success('Statut mis a jour avec succes'); },
      error: (err) => { this.toast.error(err.error?.detail || 'Erreur lors de la mise a jour du statut'); }
    });
  }

  confirmDelete(v: any) { this.deleting = v; }
  delete() {
    if (!this.deleting) return;
    this.api.deleteVisitor(this.deleting.id).subscribe({
      next: () => { this.deleting = null; this.load(); this.toast.success('Visiteur supprime avec succes'); },
      error: (err) => { this.toast.error(err.error?.detail || 'Erreur lors de la suppression'); }
    });
  }
}
