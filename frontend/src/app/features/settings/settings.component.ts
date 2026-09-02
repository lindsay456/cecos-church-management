import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header"><h2>Parametres</h2></div>
    <div class="settings-grid">
      <div class="card settings-card">
        <h3>Profil utilisateur</h3>
        <div class="settings-item"><span>Nom</span><span>{{ user?.full_name }}</span></div>
        <div class="settings-item"><span>Email</span><span>{{ user?.email }}</span></div>
        <div class="settings-item"><span>Role</span><span>{{ user?.role }}</span></div>
        <div class="settings-item"><span>Eglise</span><span>{{ user?.entity_name }}</span></div>
      </div>
      <div class="card settings-card">
        <h3>Securite</h3>
        <div class="password-form">
          <div class="pwd-input-wrap">
            <input [type]="showOldPwd ? 'text' : 'password'" name="oldPassword" placeholder="Ancien mot de passe" [(ngModel)]="oldPassword" />
            <button type="button" class="toggle-pwd" (click)="showOldPwd = !showOldPwd">
              <span class="material-icons">{{ showOldPwd ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <div class="pwd-input-wrap">
            <input [type]="showNewPwd ? 'text' : 'password'" name="newPassword" placeholder="Nouveau mot de passe" [(ngModel)]="newPassword" />
            <button type="button" class="toggle-pwd" (click)="showNewPwd = !showNewPwd">
              <span class="material-icons">{{ showNewPwd ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <button class="btn-secondary" style="margin-top:12px" (click)="changePassword()" [disabled]="changingPassword">
            {{ changingPassword ? 'Envoi...' : 'Changer le mot de passe' }}
          </button>
          <p *ngIf="pwMessage" class="pw-message" [class.success]="pwSuccess" [class.error]="!pwSuccess">{{ pwMessage }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .settings-card { padding: 24px; } .settings-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--gray-50); font-size: 14px; span:first-child { color: var(--gray-500); } span:last-child { font-weight: 600; } } .password-form { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; } .pwd-input-wrap { position: relative; input { width: 100%; padding: 10px 42px 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-family); box-sizing: border-box; &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); } } .toggle-pwd { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; .material-icons { font-size: 20px; color: var(--gray-400); } &:hover .material-icons { color: var(--gray-600); } } } button:disabled { opacity: 0.6; cursor: not-allowed; } .pw-message { margin: 4px 0 0; font-size: 13px; &.success { color: #16a34a; } &.error { color: var(--red); } }`] 
})
export class SettingsComponent {
  oldPassword = '';
  newPassword = '';
  changingPassword = false;
  pwMessage = '';
  pwSuccess = false;
  showOldPwd = false;
  showNewPwd = false;

  constructor(public auth: AuthService) {}
  get user() { return this.auth.currentUser; }

  changePassword() {
    if (!this.oldPassword || !this.newPassword) {
      this.pwSuccess = false;
      this.pwMessage = 'Veuillez remplir les deux champs.';
      return;
    }
    this.changingPassword = true;
    this.pwMessage = '';
    this.auth.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.changingPassword = false;
        this.pwSuccess = true;
        this.pwMessage = 'Mot de passe modifie avec succes.';
        this.oldPassword = '';
        this.newPassword = '';
      },
      error: (err) => {
        this.changingPassword = false;
        this.pwSuccess = false;
        this.pwMessage = err?.error?.detail || err?.error?.old_password?.[0] || err?.error?.new_password?.[0] || 'Echec du changement de mot de passe.';
      }
    });
  }
}
