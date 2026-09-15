import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-role-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Attributions de roles</h2>
        <p class="page-subtitle">Gerez les roles et permissions par entite</p>
      </div>
      <button class="btn-primary" (click)="openForm()">+ Ajouter une attribution</button>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (input)="filterList()" placeholder="Rechercher..." class="search-input">
      </div>
      <select [(ngModel)]="filterRole" (change)="filterList()">
        <option value="">Tous les roles</option>
        <option value="LOCAL_LEADER">Leader local</option>
        <option value="TREASURER">Tresorier</option>
        <option value="DEPARTMENT_LEADER">Chef de departement</option>
        <option value="PASTORAL_LEADER">Responsable pastoral</option>
        <option value="AUDITOR">Auditeur</option>
      </select>
    </div>

    <div class="table-container" *ngIf="filtered.length">
      <table>
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Role</th>
            <th>Entite de portee</th>
            <th>Descendants</th>
            <th>Periode</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of filtered">
            <td>
              <div class="user-cell">
                <div class="avatar-sm">{{ getInitials(a.user_name) }}</div>
                <div>
                  <strong>{{ a.user_name }}</strong>
                  <span class="email-text">{{ a.user_email }}</span>
                </div>
              </div>
            </td>
            <td><span class="badge" [ngClass]="getRoleBadge(a.role_code)">{{ getRoleLabel(a.role_code) }}</span></td>
            <td>{{ a.scope_name }}</td>
            <td>{{ a.can_manage_descendants ? 'Oui' : 'Non' }}</td>
            <td>
              <span *ngIf="a.starts_at || a.ends_at">{{ a.starts_at || '...' }} — {{ a.ends_at || '...' }}</span>
              <span *ngIf="!a.starts_at && !a.ends_at">Permanent</span>
            </td>
            <td><span class="badge" [class.badge-active]="a.is_active" [class.badge-inactive]="!a.is_active">{{ a.is_active ? 'Actif' : 'Inactif' }}</span></td>
            <td class="actions">
              <button class="btn-icon" title="Modifier" (click)="openForm(a)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="btn-icon btn-danger" title="Desactiver" (click)="toggleActive(a)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <h3>Aucune attribution</h3><p>Attribuez des roles aux utilisateurs par entite.</p>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Modifier' : 'Nouvelle attribution' }}</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-group"><label>Utilisateur *</label>
            <select [(ngModel)]="form.user" name="user" required>
              <option value="">Selectionner...</option>
              <option *ngFor="let u of users" [value]="u.id">{{ u.first_name }} {{ u.last_name }} ({{ u.email }})</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Role *</label>
              <select [(ngModel)]="form.role_code" name="role_code" required>
                <option value="LOCAL_LEADER">Leader local</option>
                <option value="TREASURER">Tresorier</option>
                <option value="DEPARTMENT_LEADER">Chef de departement</option>
                <option value="PASTORAL_LEADER">Responsable pastoral</option>
                <option value="CHAPEL_LEADER">Responsable de chapelle</option>
                <option value="AUDITOR">Auditeur</option>
              </select>
            </div>
            <div class="form-group"><label>Entite de portee *</label>
              <select [(ngModel)]="form.scope_entity" name="scope_entity" required>
                <option value="">Selectionner...</option>
                <option *ngFor="let e of entities" [value]="e.id">{{ e.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Date debut</label><input type="date" [(ngModel)]="form.starts_at" name="starts_at"></div>
            <div class="form-group"><label>Date fin</label><input type="date" [(ngModel)]="form.ends_at" name="ends_at"></div>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="form.can_manage_descendants" name="can_manage_descendants">
              Peut gerer les entites descendantes
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ editing ? 'Enregistrer' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
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
    .actions { display: flex; gap: 4px; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .avatar-sm { width: 32px; height: 32px; border-radius: 8px; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .email-text { display: block; font-size: 12px; color: var(--gray-400); }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-active { background: #DCFCE7; color: #166534; }
    .badge-inactive { background: var(--gray-100); color: var(--gray-500); }
    .badge-treasurer { background: #FEF3C7; color: #92400E; }
    .badge-department { background: #DBEAFE; color: #1E40AF; }
    .badge-pastoral { background: #F3E8FF; color: #7C3AED; }
    .badge-leader { background: #DCFCE7; color: #166534; }
    .badge-admin { background: #FEE2E2; color: #991B1B; }
    .badge-auditor { background: #E0E7FF; color: #3730A3; }

    .btn-primary { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: var(--primary-hover); } &:disabled { opacity: 0.6; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); }
    .btn-icon { width: 32px; height: 32px; border: none; background: var(--gray-50); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray-500);
      &:hover { background: var(--gray-100); color: var(--primary); }
    }
    .btn-icon.btn-danger { background: #FEF2F2; color: var(--red); &:hover { background: #FEE2E2; } }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-400); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius); padding: 28px; width: 100%; max-width: 580px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h3 { margin: 0; font-size: 20px; } }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .checkbox-group { label { display: flex; align-items: center; gap: 8px; cursor: pointer;
      input[type="checkbox"] { width: auto; }
    }}
    .form-row { display: flex; gap: 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-100); }
    .empty-state { text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .filters-bar { flex-direction: column; }
      .form-row { flex-direction: column; }
    }
  `]
})
export class RoleAssignmentsComponent implements OnInit {
  assignments: any[] = [];
  filtered: any[] = [];
  users: any[] = [];
  entities: any[] = [];
  search = '';
  filterRole = '';
  loading = false;
  showForm = false;
  saving = false;
  editing: any = null;
  form: any = this.getEmptyForm();

  private roleLabels: Record<string, string> = {
    LOCAL_LEADER: 'Leader local', TREASURER: 'Tresorier',
    DEPARTMENT_LEADER: 'Chef departement', PASTORAL_LEADER: 'Resp. pastoral', CHAPEL_LEADER: 'Resp. chapelle', AUDITOR: 'Auditeur', MEMBER: 'Membre',
  };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.api.getUsers().subscribe({ next: (res: any) => this.users = res.results || res || [] });
    this.api.getEntities().subscribe({ next: (res: any) => this.entities = res.results || res || [] });
  }

  getEmptyForm() {
    return { user: '', role_code: 'TREASURER', scope_entity: '', can_manage_descendants: false, starts_at: '', ends_at: '' };
  }

  load() {
    this.loading = true;
    this.api.getRoleAssignments().subscribe({
      next: (res: any) => { this.assignments = res.results || res || []; this.filterList(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.assignments.filter(a =>
      (!q || a.user_name?.toLowerCase().includes(q) || a.user_email?.toLowerCase().includes(q)) &&
      (!this.filterRole || a.role_code === this.filterRole)
    );
  }

  getRoleLabel(r: string): string { return this.roleLabels[r] || r; }
  getInitials(name: string): string { return (name || '').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2); }

  getRoleBadge(r: string): string {
    if (r === 'TREASURER') return 'badge-treasurer';
    if (r.includes('DEPARTMENT')) return 'badge-department';
    if (r === 'PASTORAL_LEADER') return 'badge-pastoral';
    if (r.includes('LEADER') || r === 'LOCAL_LEADER') return 'badge-leader';
    if (r.includes('ADMIN')) return 'badge-admin';
    if (r === 'AUDITOR') return 'badge-auditor';
    return 'badge-leader';
  }

  openForm(a?: any) {
    this.editing = a || null;
    this.form = a ? { ...a, starts_at: a.starts_at || '', ends_at: a.ends_at || '' } : this.getEmptyForm();
    this.showForm = true;
  }

  save() {
    this.saving = true;
    const obs = this.editing ? this.api.updateRoleAssignment(this.editing.id, this.form) : this.api.createRoleAssignment(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.editing = null; this.saving = false; this.load(); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  toggleActive(a: any) {
    this.api.updateRoleAssignment(a.id, { is_active: !a.is_active }).subscribe({ next: () => this.load(), error: (err) => this.toast.error(err.error?.detail || 'Erreur') });
  }
}
