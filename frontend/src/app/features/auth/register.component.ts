import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-left">
        <div class="left-content">
          <div class="brand">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16zM12 6l-4 4h2v4h4v-4h2l-4-4z"/></svg>
            </div>
            <span class="brand-name">Cecos Church Management</span>
          </div>

          <h1>Modernisez la gestion de votre communaute.</h1>
          <p class="subtitle">Rejoignez des centaines de paroisses qui utilisent Cecos Church Management pour centraliser leurs membres, leurs finances et leur vie pastorale.</p>

          <div class="testimonial">
            <div class="testimonial-avatar">JD</div>
            <div>
              <div class="testimonial-name">Jean Dupont</div>
              <div class="testimonial-role">Pasteur, Chapelle Saint-Marc</div>
              <p class="testimonial-text">"L'outil nous a permis de gagner un temps precieux sur l'administration pour nous concentrer sur l'essentiel : l'accompagnement des fideles."</p>
            </div>
          </div>
        </div>

        <div class="left-footer">
          <span>&copy; 2024 Cecos Church Management</span>
        </div>
      </div>

      <div class="login-right">
        <div class="form-wrapper">
          <h2>Creer un compte Eglise</h2>
          <p class="form-desc">Configurez votre instance de gestion en quelques minutes.</p>

          <div class="steps">
            <div class="step" [class.active]="step === 1" [class.done]="step > 1">
              <div class="step-circle">
                <svg *ngIf="step <= 1" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <svg *ngIf="step > 1" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
              <span class="step-label">ADMINISTRATEUR</span>
            </div>
            <div class="step-line" [class.active]="step > 1"></div>
            <div class="step" [class.active]="step === 2" [class.done]="step > 2">
              <div class="step-circle">
                <svg *ngIf="step <= 2" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16z"/></svg>
                <svg *ngIf="step > 2" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
              <span class="step-label">EGLISE</span>
            </div>
            <div class="step-line" [class.active]="step > 2"></div>
            <div class="step" [class.active]="step === 3">
              <div class="step-circle">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2L2 7v2h20V7L12 2zm0 2.18L18.18 7H5.82L12 4.18zM4 11v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7H4zm3 2h2v4H7v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4z"/></svg>
              </div>
              <span class="step-label">CHAPELLE</span>
            </div>
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>
          <div class="success-msg" *ngIf="success">{{ success }}</div>

          <!-- Step 1: Admin -->
          <form *ngIf="step === 1" (ngSubmit)="nextStep()" class="form-content">
            <div class="form-row">
              <div class="form-group">
                <label>Prenom</label>
                <input class="form-input" [(ngModel)]="data.first_name" name="first_name" placeholder="Ex: Jean" required>
              </div>
              <div class="form-group">
                <label>Nom</label>
                <input class="form-input" [(ngModel)]="data.last_name" name="last_name" placeholder="Ex: Dupont" required>
              </div>
            </div>
            <div class="form-group">
              <label>Email professionnel</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                <input type="email" class="form-input" [(ngModel)]="data.email" name="email" placeholder="prenom.nom@google.com" required>
              </div>
              <span class="hint">Seules les adresses gmail.com sont acceptees.</span>
            </div>
            <div class="form-group">
              <label>Mot de passe</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                <input [type]="showPwd ? 'text' : 'password'" class="form-input" [(ngModel)]="data.password" name="password" placeholder="Mot de passe" required minlength="8">
                <button type="button" class="toggle-pwd" (click)="showPwd = !showPwd">
                  <svg *ngIf="!showPwd" viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg *ngIf="showPwd" viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2z"/></svg>
                </button>
              </div>
              <span class="hint">Au moins 8 caracteres avec majuscules et chiffres.</span>
            </div>
            <div class="form-group">
              <label>Confirmer le mot de passe</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                <input [type]="showConfirmPwd ? 'text' : 'password'" class="form-input" [(ngModel)]="data.password_confirm" name="password_confirm" placeholder="Confirmez le mot de passe" required>
                <button type="button" class="toggle-pwd" (click)="showConfirmPwd = !showConfirmPwd">
                  <svg *ngIf="!showConfirmPwd" viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg *ngIf="showConfirmPwd" viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2z"/></svg>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Telephone</label>
              <input class="form-input" [(ngModel)]="data.phone" name="phone" placeholder="+237 6XX XXX XXX">
            </div>
            <button type="submit" class="btn-next">Suivant <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
          </form>

          <!-- Step 2: Church -->
          <form *ngIf="step === 2" (ngSubmit)="nextStep()" class="form-content">
            <div class="form-group">
              <label>Denomination *</label>
              <select class="form-select" [(ngModel)]="data.denomination" name="denomination" required>
                <option value="">-- Selectionnez --</option>
                <option value="CATHOLIC">Catholique</option>
                <option value="PROTESTANT">Protestant</option>
                <option value="ADVENTIST">Adventiste</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nom de l'eglise *</label>
              <input class="form-input" [(ngModel)]="data.church_name" name="church_name" placeholder="Ex: Eglise Evangelique de Yaounde" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Code *</label>
                <input class="form-input" [(ngModel)]="data.church_code" name="church_code" placeholder="Ex: EE-LYA-001" required>
              </div>
              <div class="form-group">
                <label>Pays *</label>
                <input class="form-input" [(ngModel)]="data.country" name="country" placeholder="Ex: Cameroun" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Ville *</label>
                <input class="form-input" [(ngModel)]="data.city" name="city" placeholder="Ex: Yaounde" required>
              </div>
              <div class="form-group">
                <label>Adresse</label>
                <input class="form-input" [(ngModel)]="data.address" name="address" placeholder="Quartier, rue...">
              </div>
            </div>
            <div class="btn-row">
              <button type="button" class="btn-secondary" (click)="step = 1">Retour</button>
              <button type="submit" class="btn-next">Suivant <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
            </div>
          </form>

          <!-- Step 3: Chapel -->
          <form *ngIf="step === 3" (ngSubmit)="submit()" class="form-content">
            <div class="form-group">
              <label>Nom de la premiere chapelle/paroisse *</label>
              <input class="form-input" [(ngModel)]="data.chapel_name" name="chapel_name" placeholder="Ex: Chapelle Bonamoussadi" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Code *</label>
                <input class="form-input" [(ngModel)]="data.chapel_code" name="chapel_code" placeholder="Ex: CH-001" required>
              </div>
              <div class="form-group">
                <label>Ville</label>
                <input class="form-input" [(ngModel)]="data.chapel_city" name="chapel_city" placeholder="Ville de la chapelle">
              </div>
            </div>
            <div class="form-group">
              <label>Adresse</label>
              <input class="form-input" [(ngModel)]="data.chapel_address" name="chapel_address" placeholder="Quartier, rue...">
            </div>
            <div class="btn-row">
              <button type="button" class="btn-secondary" (click)="step = 2">Retour</button>
              <button type="submit" class="btn-next" [disabled]="loading">
                <span *ngIf="!loading">Creer mon compte</span>
                <span *ngIf="loading">Creation en cours...</span>
              </button>
            </div>
          </form>

          <p class="login-link">
            Vous avez deja un compte ?
            <a routerLink="/login">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display: flex; min-height: 100vh; }
    .login-left {
      flex: 0 0 40%;
      background: linear-gradient(135deg, #1a1a2e 0%, #1e3a5f 50%, #1a1a2e 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px;
      position: relative;
      overflow: hidden;
      &::before { content: ''; position: absolute; top: -50%; right: -30%; width: 600px; height: 600px; border-radius: 50%; background: rgba(37,99,235,0.08); }
    }
    .left-content { position: relative; z-index: 1; }
    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
    .brand-icon { width: 42px; height: 42px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .brand-name { font-size: 18px; font-weight: 700; }
    .login-left h1 { font-size: 30px; font-weight: 800; line-height: 1.2; color: #fff; margin-bottom: 16px; max-width: 380px; }
    .subtitle { font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 40px; max-width: 400px; }
    .testimonial { background: rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; display: flex; gap: 14px; backdrop-filter: blur(10px); }
    .testimonial-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
    .testimonial-name { font-weight: 600; font-size: 14px; }
    .testimonial-role { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
    .testimonial-text { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.6; font-style: italic; margin: 0; }
    .left-footer { position: relative; z-index: 1; font-size: 13px; color: rgba(255,255,255,0.5); }
    .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--white); }
    .form-wrapper { width: 100%; max-width: 500px; h2 { font-size: 24px; font-weight: 800; color: var(--gray-900); margin-bottom: 6px; } }
    .form-desc { font-size: 15px; color: var(--gray-500); margin-bottom: 28px; }

    .steps { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 32px; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .step-circle {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: var(--gray-100); color: var(--gray-400);
      transition: all 0.3s;
      &.active, .step.active & { background: var(--primary); color: #fff; }
      .step.done & { background: var(--green); color: #fff; }
    }
    .step-label { font-size: 11px; font-weight: 700; color: var(--gray-400); letter-spacing: 0.5px; .step.active & { color: var(--primary); } .step.done & { color: var(--green); } }
    .step-line { width: 60px; height: 2px; background: var(--gray-200); margin-bottom: 22px; &.active { background: var(--green); } }

    .form-content { .form-group { margin-bottom: 16px; } }
    .input-with-icon {
      position: relative;
      svg:first-child { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); z-index: 1; }
      .form-input { padding-left: 42px; padding-right: 42px; }
      .toggle-pwd {
        position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; padding: 4px;
        display: flex; align-items: center; justify-content: center;
      }
    }
    .hint { font-size: 12px; color: var(--gray-400); margin-top: 4px; display: block; }
    .btn-next {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      width: 100%; padding: 13px;
      background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm);
      font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font-family);
      &:hover { background: var(--primary-hover); }
      &:disabled { opacity: 0.6; }
    }
    .btn-secondary { padding: 12px 24px; background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; cursor: pointer; font-family: var(--font-family); &:hover { background: var(--gray-50); } }
    .btn-row { display: flex; gap: 12px; margin-top: 8px; .btn-secondary { flex: 1; } .btn-next { flex: 2; } }
    .error-msg { background: var(--red-light); color: var(--red); padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 20px; border: 1px solid #fecaca; }
    .success-msg { background: var(--green-light); color: var(--green); padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 20px; border: 1px solid #bbf7d0; }
    .login-link { text-align: center; font-size: 14px; color: var(--gray-500); margin-top: 24px; a { font-weight: 600; } }
    @media (max-width: 900px) { .login-page { flex-direction: column; } .login-left { flex: none; padding: 32px 24px; } .login-left h1 { font-size: 22px; } .testimonial { display: none; } }
  `]
})
export class RegisterComponent {
  step = 1;
  loading = false;
  error = '';
  success = '';
  showPwd = false;
  showConfirmPwd = false;
  data: any = {
    denomination: '', church_name: '', church_code: '', country: '', city: '', address: '',
    first_name: '', last_name: '', email: '', phone: '', password: '', password_confirm: '',
    chapel_name: '', chapel_code: '', chapel_city: '', chapel_address: '',
  };

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) router.navigate(['/app/dashboard']);
  }

  nextStep() {
    this.error = '';
    if (this.step === 1) {
      if (!this.data.first_name || !this.data.last_name || !this.data.email || !this.data.password) {
        this.error = 'Veuillez remplir tous les champs obligatoires'; return;
      }
      if (!this.data.email.toLowerCase().endsWith('@gmail.com')) {
        this.error = 'Seules les adresses email @gmail.com sont acceptees'; return;
      }
      if (this.data.password !== this.data.password_confirm) { this.error = 'Les mots de passe ne correspondent pas'; return; }
      if (this.data.password.length < 8) { this.error = 'Le mot de passe doit contenir au moins 8 caracteres'; return; }
    }
    if (this.step === 2) {
      if (!this.data.church_name || !this.data.church_code || !this.data.denomination || !this.data.country || !this.data.city) {
        this.error = 'Veuillez remplir tous les champs obligatoires'; return;
      }
    }
    this.step++;
  }

  submit() {
    if (!this.data.chapel_name || !this.data.chapel_code) { this.error = 'Veuillez remplir les champs obligatoires de la chapelle'; return; }
    this.loading = true;
    this.error = '';
    this.auth.register(this.data).subscribe({
      next: () => {
        this.success = 'Compte cree avec succes ! Redirection...';
        setTimeout(() => this.router.navigate(['/app/dashboard']), 1500);
      },
      error: (err) => { this.loading = false; this.error = err.error?.detail || err.error?.church_name?.[0] || 'Erreur lors de la creation du compte'; }
    });
  }
}
