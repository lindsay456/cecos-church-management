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
      <button class="btn-primary btn-invite" (click)="openInviteModal()">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-right:6px;vertical-align:middle"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        Inviter un membre
      </button>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (input)="filterList()" placeholder="Rechercher un membre..." class="search-input">
      </div>
      <select [(ngModel)]="filterRole" (change)="filterList()">
        <option value="">Tous les roles</option>
        <option value="TREASURER">Tresorier</option>
        <option value="DEPARTMENT_LEADER">Chef de departement</option>
        <option value="PASTORAL_LEADER">Responsable pastoral</option>
        <option value="CHAPEL_LEADER">Responsable de chapelle</option>
        <option value="AUDITOR">Auditeur</option>
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
            <svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M12 2L2 7v2h20V7L12 2zm0 2.18L18.18 7H5.82L12 4.18zM4 11v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7H4zm3 2h2v4H7v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4z"/></svg>
            <span>{{ member.entity_name || 'Eglise' }}</span>
          </div>
          <div class="detail-row" *ngIf="member.is_active !== undefined">
            <span class="status-dot" [class.active]="member.is_active" [class.inactive]="!member.is_active"></span>
            <span>{{ member.is_active ? 'Actif' : 'Inactif' }}</span>
          </div>
        </div>
        <div class="team-actions">
          <button class="btn-outline-sm" (click)="editMember(member)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
            Modifier
          </button>
          <button class="btn-danger-sm" (click)="confirmDelete(member)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            Retirer
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--gray-300)"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      <h3>Aucun membre d'equipe</h3>
      <p>Invitez des membres pour gerer votre eglise.</p>
      <button class="btn-primary" style="margin-top:12px" (click)="openInviteModal()">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-right:6px;vertical-align:middle"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        Inviter un membre
      </button>
    </div>

    <!-- Invite Modal -->
    <div class="modal-overlay" *ngIf="showInvite" (click)="closeInviteModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Inviter un membre d'equipe</h3>
          <button class="btn-close" (click)="closeInviteModal()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <form (ngSubmit)="sendInvite()">
          <div class="form-row">
            <div class="form-group">
              <label>Prenom *</label>
              <input [(ngModel)]="inviteForm.first_name" name="first_name" required placeholder="Prenom">
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input [(ngModel)]="inviteForm.last_name" name="last_name" required placeholder="Nom">
            </div>
          </div>
          <div class="form-group">
            <label>Email * (pour recevoir les identifiants)</label>
            <input type="email" [(ngModel)]="inviteForm.email" name="email" required placeholder="prenom.nom@gmail.com">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telephone</label>
              <input [(ngModel)]="inviteForm.phone" name="phone" placeholder="+237 6XX XXX XXX">
            </div>
            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="inviteForm.role" name="role" required>
                <option value="TREASURER">Tresorier</option>
                <option value="DEPARTMENT_LEADER">Chef de departement</option>
                <option value="PASTORAL_LEADER">Responsable pastoral</option>
                <option value="CHAPEL_LEADER">Responsable de chapelle</option>
                <option value="AUDITOR">Auditeur</option>
              </select>
            </div>
          </div>
          <div class="invite-info">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#3b82f6" style="flex-shrink:0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            <span>Un mot de passe sera genere automatiquement et envoye par email a l'adresse indiquee.</span>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closeInviteModal()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">
              <svg *ngIf="!saving" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right:6px;vertical-align:middle"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              {{ saving ? 'Envoi en cours...' : 'Envoyer l\'invitation' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Password Generated Modal -->
    <div class="modal-overlay" *ngIf="showPasswordModal" (click)="showPasswordModal = false">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Membre cree avec succes</h3>
          <button class="btn-close" (click)="showPasswordModal = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div class="password-result">
          <div class="password-avatar" [style.background]="getAvatarColor(inviteForm.role)">
            {{ getInitialsFromName(inviteForm.first_name, inviteForm.last_name) }}
          </div>
          <p><strong>{{ inviteForm.first_name }} {{ inviteForm.last_name }}</strong></p>
          <p class="password-email">{{ inviteForm.email }}</p>
          <div class="password-box">
            <label>Mot de passe genere</label>
            <div class="password-value">
              <code>{{ generatedPassword }}</code>
              <button class="btn-copy" (click)="copyPassword()" [title]="'Copier'">
                <svg *ngIf="!copied" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                <svg *ngIf="copied" viewBox="0 0 24 24" width="18" height="18" fill="#16a34a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </button>
            </div>
          </div>
          <p class="password-note">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#3b82f6" style="vertical-align:middle;margin-right:4px"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            Ce mot de passe a ete envoye par email a <strong>{{ inviteForm.email }}</strong>.
            Le membre pourra le changer apres sa premiere connexion.
          </p>
        </div>
        <div class="form-actions">
          <button class="btn-primary" (click)="showPasswordModal = false">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" *ngIf="showEdit" (click)="showEdit = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Modifier le membre</h3>
          <button class="btn-close" (click)="showEdit = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <form (ngSubmit)="saveEdit()">
          <div class="form-row">
            <div class="form-group">
              <label>Prenom *</label>
              <input [(ngModel)]="editForm.first_name" name="first_name" required placeholder="Prenom">
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input [(ngModel)]="editForm.last_name" name="last_name" required placeholder="Nom">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Telephone</label>
              <input [(ngModel)]="editForm.phone" name="phone" placeholder="+237 6XX XXX XXX">
            </div>
            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="editForm.role" name="role" required>
                <option value="TREASURER">Tresorier</option>
                <option value="DEPARTMENT_LEADER">Chef de departement</option>
                <option value="PASTORAL_LEADER">Responsable pastoral</option>
                <option value="CHAPEL_LEADER">Responsable de chapelle</option>
                <option value="AUDITOR">Auditeur</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showEdit = false">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div class="modal-overlay" *ngIf="deleting" (click)="deleting = null">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Retirer de l'equipe</h3>
          <button class="btn-close" (click)="deleting = null">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
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
    .team-card { background: var(--white); border-radius: var(--radius); padding: 20px; border: 1px solid var(--gray-100); box-shadow: var(--shadow-sm); transition: all 0.2s;
      &:hover { box-shadow: var(--shadow-md); }
    }
    .team-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; flex-shrink: 0; }
    .team-info { flex: 1; min-width: 0;
      h4 { margin: 0; font-size: 15px; font-weight: 700; color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .team-email { margin: 2px 0 0; font-size: 13px; color: var(--gray-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }
    .team-details { margin-bottom: 16px; }
    .detail-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; color: var(--gray-500); }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .status-dot.active { background: #16a34a; }
    .status-dot.inactive { background: #dc2626; }
    .team-actions { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid var(--gray-100); }

    .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .badge-treasurer { background: #FEF3C7; color: #92400E; }
    .badge-department { background: #DBEAFE; color: #1E40AF; }
    .badge-pastoral { background: #F3E8FF; color: #7C3AED; }
    .badge-chapel { background: #FFF7ED; color: #EA580C; }
    .badge-leader { background: #DCFCE7; color: #166534; }
    .badge-admin { background: #FEE2E2; color: #991B1B; }
    .badge-auditor { background: #F3F4F6; color: #374151; }

    .btn-primary { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family); display: inline-flex; align-items: center; gap: 6px;
      &:hover { background: var(--primary-hover); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .btn-invite { font-size: 14px; padding: 10px 20px; border-radius: var(--radius-sm); box-shadow: 0 2px 8px rgba(37,99,235,0.2);
      &:hover { box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); }
    .btn-outline-sm { padding: 6px 14px; background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-family: var(--font-family); display: inline-flex; align-items: center; gap: 4px;
      &:hover { background: var(--gray-50); }
    }
    .btn-danger-sm { padding: 6px 14px; background: var(--white); color: var(--red); border: 1px solid #FECACA; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-family: var(--font-family); display: inline-flex; align-items: center; gap: 4px;
      &:hover { background: #FEF2F2; }
    }
    .btn-danger { padding: 10px 20px; background: var(--red); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: #DC2626; }
    }
    .btn-close { background: none; border: none; cursor: pointer; padding: 4px; svg { color: var(--gray-400); } }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 520px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-xl); }
    .modal-sm { max-width: 420px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h3 { margin: 0; font-size: 20px; color: var(--gray-900); } }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .form-row { display: flex; gap: 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-100); }

    .invite-info { display: flex; align-items: flex-start; gap: 8px; padding: 12px 14px; background: #EFF6FF; border-radius: var(--radius-sm); font-size: 13px; color: #1E40AF; margin-bottom: 16px;
      svg { margin-top: 1px; flex-shrink: 0; }
    }

    .password-result { text-align: center; padding: 8px 0; }
    .password-avatar { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 20px; margin: 0 auto 12px; }
    .password-email { font-size: 13px; color: var(--gray-400); margin: 2px 0 16px; }
    .password-box { background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px;
      label { display: block; font-size: 12px; font-weight: 600; color: var(--gray-500); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    }
    .password-value { display: flex; align-items: center; justify-content: center; gap: 8px;
      code { font-size: 18px; font-weight: 700; color: var(--primary); letter-spacing: 1px; background: var(--white); padding: 6px 14px; border-radius: 6px; border: 1px solid var(--gray-200); }
    }
    .btn-copy { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--gray-500);
      &:hover { background: var(--gray-100); color: var(--primary); }
    }
    .password-note { font-size: 13px; color: var(--gray-500); display: flex; align-items: flex-start; gap: 6px; text-align: left; background: #ECFDF5; padding: 12px; border-radius: var(--radius-sm);
      svg { margin-top: 1px; flex-shrink: 0; }
    }

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
  saving = false;

  showInvite = false;
  inviteForm: any = { first_name: '', last_name: '', email: '', phone: '', role: 'TREASURER' };

  showPasswordModal = false;
  generatedPassword = '';
  copied = false;

  showEdit = false;
  editingMember: any = null;
  editForm: any = {};

  deleting: any = null;

  constructor(private api: ApiService, private auth: AuthService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

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

  openInviteModal() {
    this.inviteForm = { first_name: '', last_name: '', email: '', phone: '', role: 'TREASURER' };
    this.showInvite = true;
  }

  closeInviteModal() { this.showInvite = false; this.saving = false; }

  sendInvite() {
    this.saving = true;
    this.api.createTeamMember(this.inviteForm).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.generatedPassword = res.generated_password || 'Voir email';
        this.showInvite = false;
        this.showPasswordModal = true;
        this.load();
        this.toast.success('Membre ajoute a l\'equipe');
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.detail || 'Erreur lors de l\'invitation');
      }
    });
  }

  copyPassword() {
    navigator.clipboard.writeText(this.generatedPassword);
    this.copied = true;
    setTimeout(() => { this.copied = false; }, 2000);
    this.toast.success('Mot de passe copie');
  }

  editMember(m: any) {
    this.editingMember = m;
    this.editForm = { first_name: m.first_name, last_name: m.last_name, phone: m.phone || '', role: m.role };
    this.showEdit = true;
  }

  saveEdit() {
    this.saving = true;
    this.api.updateTeamMember(this.editingMember.id, this.editForm).subscribe({
      next: () => { this.showEdit = false; this.saving = false; this.load(); this.toast.success('Membre modifie'); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur'); }
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

  getInitialsFromName(first: string, last: string): string {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
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
    if (role === 'AUDITOR') return 'badge-auditor';
    return 'badge-department';
  }

  getAvatarColor(role: string): string {
    if (role === 'TREASURER') return '#D97706';
    if (role.includes('DEPARTMENT') || role === 'CHURCH_LEADER') return '#2563EB';
    if (role === 'PASTORAL_LEADER') return '#7C3AED';
    if (role === 'CHAPEL_LEADER') return '#EA580C';
    if (role === 'AUDITOR') return '#6B7280';
    return '#059669';
  }
}
