import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Mon profil</h2>
      <button class="btn-secondary" *ngIf="!editing" (click)="startEdit()">
        <span class="material-icons" style="font-size:16px">edit</span>
        Modifier
      </button>
    </div>

    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-lg">{{ userInitials }}</div>
        <div class="profile-info">
          <h3>{{ user?.full_name }}</h3>
          <p class="profile-subtitle">{{ roleLabel }} - {{ user?.entity_name }}</p>
          <span class="badge" [class.badge-active]="user?.is_active">
            {{ user?.is_active ? 'Actif' : 'Inactif' }}
          </span>
        </div>
      </div>

      <!-- Read-only view -->
      <div class="profile-grid" *ngIf="!editing">
        <div class="field">
          <label>Prenom</label>
          <span>{{ user?.first_name }}</span>
        </div>
        <div class="field">
          <label>Nom</label>
          <span>{{ user?.last_name }}</span>
        </div>
        <div class="field">
          <label>Email</label>
          <span>{{ user?.email }}</span>
        </div>
        <div class="field">
          <label>Telephone</label>
          <span>{{ user?.phone || '-' }}</span>
        </div>
        <div class="field">
          <label>Role</label>
          <span>{{ roleLabel }}</span>
        </div>
        <div class="field">
          <label>Eglise / Entite</label>
          <span>{{ user?.entity_name }}</span>
        </div>
        <div class="field">
          <label>Derniere connexion</label>
          <span>{{ user?.last_login | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
      </div>

      <!-- Edit form -->
      <form *ngIf="editing" (ngSubmit)="save()">
        <div class="form-row">
          <div class="form-group">
            <label>Prenom *</label>
            <input [(ngModel)]="editForm.first_name" name="first_name" required>
          </div>
          <div class="form-group">
            <label>Nom *</label>
            <input [(ngModel)]="editForm.last_name" name="last_name" required>
          </div>
        </div>
        <div class="form-group">
          <label>Telephone</label>
          <input [(ngModel)]="editForm.phone" name="phone" placeholder="6XX XXX XXX">
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="editing = false">Annuler</button>
          <button type="submit" class="btn-primary" [disabled]="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
        <p class="save-message" *ngIf="saveMessage" [class.success]="saveSuccess">{{ saveMessage }}</p>
      </form>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h2 { margin: 0; font-size: 22px; } }
    .profile-card {
      background: var(--white); border-radius: var(--radius-lg); padding: 32px;
      box-shadow: var(--shadow-sm); max-width: 700px; border: 1px solid var(--gray-100);
    }
    .profile-header { display: flex; gap: 20px; align-items: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--gray-100); }
    .avatar-lg {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #6366f1);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 700; box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    .profile-info { h3 { margin: 0 0 4px; font-size: 20px; } }
    .profile-subtitle { margin: 0 0 8px; color: var(--gray-500); font-size: 14px; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-active { background: #dcfce7; color: #166534; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    .field { padding: 14px 0; border-bottom: 1px solid var(--gray-50); display: flex; flex-direction: column; gap: 2px;
      label { font-size: 12px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; }
      span { font-size: 14px; color: var(--gray-800); font-weight: 500; }
    }
    .form-row { display: flex; gap: 12px; margin-bottom: 14px; }
    .form-group {
      flex: 1; margin-bottom: 14px;
      label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input {
        width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
        font-size: 14px; font-family: var(--font-family); box-sizing: border-box;
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--primary); color: #fff; border: none;
      border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font-family); transition: all 0.15s;
      &:hover { background: var(--primary-hover); } &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--gray-100);
      color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-family); font-size: 14px; font-weight: 500;
      &:hover { background: var(--gray-200); }
    }
    .save-message { margin-top: 12px; font-size: 13px; &.success { color: #16a34a; } }
  `]
})
export class ProfileComponent implements OnInit {
  editing = false;
  saving = false;
  editForm: any = { first_name: '', last_name: '', phone: '' };
  saveMessage = '';
  saveSuccess = false;

  private roleLabels: Record<string, string> = {
    LOCAL_LEADER: 'Leader local', TREASURER: 'Tresorier',
    DEPARTMENT_LEADER: 'Responsable de departement', PASTORAL_LEADER: 'Responsable pastoral',
    AUDITOR: 'Auditeur', MEMBER: 'Membre'
  };

  constructor(public auth: AuthService, private api: ApiService) {}
  get user() { return this.auth.currentUser; }
  get roleLabel(): string { return this.roleLabels[this.user?.role || ''] || this.user?.role || ''; }
  get userInitials(): string { const u = this.user; return u ? ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() : '?'; }

  ngOnInit() {}

  startEdit() {
    this.editing = true;
    this.saveMessage = '';
    this.editForm = {
      first_name: this.user?.first_name || '',
      last_name: this.user?.last_name || '',
      phone: this.user?.phone || ''
    };
  }

  save() {
    this.saving = true;
    this.saveMessage = '';
    this.api.updateUser(this.user!.id, this.editForm).subscribe({
      next: (updated: User) => {
        localStorage.setItem('user', JSON.stringify({ ...this.user, ...this.editForm }));
        this.auth.reloadUser();
        this.saving = false;
        this.editing = false;
        this.saveSuccess = true;
        this.saveMessage = 'Profil mis a jour avec succes.';
      },
      error: (err) => {
        this.saving = false;
        this.saveSuccess = false;
        this.saveMessage = err.error?.detail || 'Erreur lors de la mise a jour.';
      }
    });
  }
}
