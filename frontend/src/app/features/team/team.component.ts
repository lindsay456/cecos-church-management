import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Mon equipe</h2>
        <p class="page-subtitle">Gerez les membres de votre equipe et leurs acces</p>
      </div>
      <button class="btn-primary" (click)="openForm()">+ Ajouter un membre</button>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (keyup.enter)="load()" placeholder="Rechercher un membre..." class="search-input">
      </div>
      <select [(ngModel)]="filterRole" (change)="load()">
        <option value="">Tous les roles</option>
        <option value="TREASURER">Tresorier</option>
        <option value="DEPARTMENT_LEADER">Chef de departement</option>
        <option value="PASTORAL_LEADER">Responsable pastoral</option>
        <option value="CHAPEL_LEADER">Responsable de chapelle</option>
      </select>
    </div>

    <div class="team-grid">
      <div class="team-card" *ngFor="let member of filtered">
        <div class="team-card-header">
          <div class="avatar" [style.background]="getAvatarColor(member.role)">
            {{ getInitials(member) }}
          </div>
          <div class="team-info">
            <h4>{{ member.first_name }} {{ member.last_name }}</h4>
            <p class="team-email">{{ member.email }}</p>
          </div>
          <span class="badge" [ngClass]="getRoleBadgeClass(member.role)">{{ getRoleLabel(member.role) }}</span>
        </div>
        <div class="team-details">
          <div class="detail-row" *ngIf="member.phone">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
            <span>{{ member.phone }}</span>
          </div>
          <div class="detail-row">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/></svg>
            <span>{{ member.entity_name || 'Eglise' }}</span>
          </div>
        </div>
        <div class="team-actions">
          <button class="btn-outline-sm" (click)="editMember(member)">Modifier</button>
          <button class="btn-danger-sm" (click)="confirmDelete(member)">Retirer</button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--gray-300)"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      <h3>Aucun membre d'equipe</h3>
      <p>Ajoutez des membres pour gerer votre eglise.</p>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Modifier le membre' : formTitle }}</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group">
              <label>Prenom *</label>
              <input [(ngModel)]="form.first_name" name="first_name" required placeholder="Prenom">
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input [(ngModel)]="form.last_name" name="last_name" required placeholder="Nom">
            </div>
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" [(ngModel)]="form.email" name="email" required placeholder="prenom.nom@gmail.com">
          </div>
          <div class="form-group" *ngIf="!editing">
            <label>Mot de passe *</label>
            <input type="password" [(ngModel)]="form.password" name="password" required placeholder="Mot de passe" minlength="8">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telephone</label>
              <input [(ngModel)]="form.phone" name="phone" placeholder="+237 6XX XXX XXX">
            </div>
            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="form.role" name="role" required>
                <option value="TREASURER">Tresorier</option>
                <option value="DEPARTMENT_LEADER">Chef de departement</option>
                <option value="PASTORAL_LEADER">Responsable pastoral</option>
                <option value="CHAPEL_LEADER">Responsable de chapelle</option>
              </select>
            </div>
          </div>
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
        <div class="modal-header">
          <h3>Retirer de l'equipe</h3>
          <button class="btn-close" (click)="deleting = null">&times;</button>
        </div>
        <p>Voulez-vous retirer <strong>{{ deleting?.first_name }} {{ deleting?.last_name }}</strong> de l'equipe ?</p>
        <div class="form-actions">
          <button class="btn-secondary" (click)="deleting = null">Annuler</button>
          <button class="btn-danger" (click)="remove()">Retirer</button>
        </div>
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

    .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .team-card { background: var(--white); border-radius: var(--radius); padding: 20px; border: 1px solid var(--gray-100); box-shadow: var(--shadow-sm); }
    .team-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; flex-shrink: 0; }
    .team-info { flex: 1; min-width: 0;
      h4 { margin: 0; font-size: 15px; font-weight: 700; color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .team-email { margin: 2px 0 0; font-size: 13px; color: var(--gray-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }
    .team-details { margin-bottom: 16px; }
    .detail-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; color: var(--gray-500); }
    .team-actions { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid var(--gray-100); }

    .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .badge-treasurer { background: #FEF3C7; color: #92400E; }
    .badge-department { background: #DBEAFE; color: #1E40AF; }
    .badge-pastoral { background: #F3E8FF; color: #7C3AED; }
    .badge-chapel { background: #FFF7ED; color: #EA580C; }
    .badge-leader { background: #DCFCE7; color: #166534; }
    .badge-admin { background: #FEE2E2; color: #991B1B; }

    .btn-primary { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: var(--primary-hover); }
      &:disabled { opacity: 0.6; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); }
    .btn-outline-sm { padding: 6px 14px; background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-family: var(--font-family);
      &:hover { background: var(--gray-50); }
    }
    .btn-danger-sm { padding: 6px 14px; background: var(--white); color: var(--red); border: 1px solid #FECACA; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-family: var(--font-family);
      &:hover { background: #FEF2F2; }
    }
    .btn-danger { padding: 10px 20px; background: var(--red); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: #DC2626; }
    }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-400); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius); padding: 28px; width: 100%; max-width: 520px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-sm { max-width: 400px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h3 { margin: 0; font-size: 20px; color: var(--gray-900); }
    }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
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
      .filters-bar { flex-direction: column; }
      .team-grid { grid-template-columns: 1fr; }
      .form-row { flex-direction: column; }
    }
  `]
})
export class TeamComponent implements OnInit {
  members: any[] = [];
  filtered: any[] = [];
  search = '';
  filterRole = '';
  loading = false;
  showForm = false;
  saving = false;
  editing: any = null;
  deleting: any = null;
  form: any = this.getEmptyForm();
  formTitle = 'Ajouter un membre d\'équipe';

  constructor(private api: ApiService, private auth: AuthService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  getEmptyForm() {
    return { first_name: '', last_name: '', email: '', password: '', phone: '', role: 'TREASURER' };
  }

  load() {
    this.loading = true;
    this.api.getTeam().subscribe({
      next: (res: any) => {
        this.members = (res.results || res || []).filter((m: any) => m.email !== this.auth.currentUser?.email);
        this.filterList();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.members.filter(m =>
      (!q || m.first_name?.toLowerCase().includes(q) || m.last_name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)) &&
      (!this.filterRole || m.role === this.filterRole)
    );
  }

  openForm(member?: any) {
    this.editing = member || null;
    this.form = member ? { ...member, password: '' } : this.getEmptyForm();
    this.showForm = true;
  }

  editMember(m: any) { this.openForm(m); }

  save() {
    this.saving = true;
    const obs = this.editing
      ? this.api.updateTeamMember(this.editing.id, this.form)
      : this.api.createTeamMember(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.editing = null; this.saving = false; this.load(); this.toast.success('Membre d\'equipe sauvegarde avec succes'); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur lors de la sauvegarde'); }
    });
  }

  confirmDelete(m: any) { this.deleting = m; }

  remove() {
    if (!this.deleting) return;
    this.api.deleteTeamMember(this.deleting.id).subscribe({
      next: () => { this.deleting = null; this.load(); this.toast.success('Membre retire de l\'equipe'); },
      error: (err) => { this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  getInitials(m: any): string {
    return ((m.first_name?.[0] || '') + (m.last_name?.[0] || '')).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      TREASURER: 'Tresorier', CHURCH_LEADER: 'Chef departement',
      DEPARTMENT_LEADER: 'Chef departement', PASTORAL_LEADER: 'Resp. pastoral',
      CHAPEL_LEADER: 'Resp. chapelle', LOCAL_LEADER: 'Leader local', AUDITOR: 'Auditeur', MEMBER: 'Membre',
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    if (role === 'TREASURER') return 'badge-treasurer';
    if (role.includes('DEPARTMENT') || role === 'CHURCH_LEADER') return 'badge-department';
    if (role === 'PASTORAL_LEADER') return 'badge-pastoral';
    if (role === 'CHAPEL_LEADER') return 'badge-chapel';
    if (role === 'LOCAL_LEADER') return 'badge-admin';
    return 'badge-department';
  }

  getAvatarColor(role: string): string {
    if (role === 'TREASURER') return '#D97706';
    if (role.includes('DEPARTMENT') || role === 'CHURCH_LEADER') return '#2563EB';
    if (role === 'PASTORAL_LEADER') return '#7C3AED';
    if (role === 'CHAPEL_LEADER') return '#EA580C';
    return '#059669';
  }
}
