import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-left">
        <div class="left-content">
          <div class="brand">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16zM12 6l-4 4h2v4h4v-4h2l-4-4z"/>
              </svg>
            </div>
            <span class="brand-name">Cecos Church Management</span>
          </div>

          <h1>La gestion de votre eglise, simplifiee.</h1>
          <p class="subtitle">Rejoignez des milliers de communautes qui utilisent Cecos Church Management pour centraliser leur administration, suivre leurs membres et dynamiser leur vie pastorale.</p>

          <div class="features">
            <div class="feature-item">
              <div class="feature-check">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
              <span>Securite des donnees conforme au RGPD</span>
            </div>
            <div class="feature-item">
              <div class="feature-check">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
              <span>Gestion multi-chapelles intuitive</span>
            </div>
            <div class="feature-item">
              <div class="feature-check">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
              <span>Interface disponible en plusieurs langues</span>
            </div>
          </div>
        </div>

        <div class="left-footer">
          <span>&copy; 2024 Cecos Church Management</span>
          <span class="sep">&bull;</span>
          <a href="#">Confidentialite</a>
          <span class="sep">&bull;</span>
          <a href="#">Support</a>
        </div>
      </div>

      <div class="login-right">
        <div class="form-wrapper">
          <h2>Bon retour parmi nous</h2>
          <p class="form-desc">Veuillez entrer vos identifiants pour acceder a votre tableau de bord.</p>

          <div class="error-msg" *ngIf="error">{{ error }}</div>

          <form (ngSubmit)="onLogin()">
            <div class="form-group">
              <label>Adresse e-mail</label>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                <input type="email" [(ngModel)]="email" name="email" placeholder="prenom.nom@google.com" autocomplete="email" required>
              </div>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label>Mot de passe</label>
                <a href="#" class="forgot-link">Mot de passe oublie ?</a>
              </div>
              <div class="input-with-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Mot de passe" autocomplete="current-password" required>
                <button type="button" class="toggle-pwd" (click)="showPwd = !showPwd">
                  <svg *ngIf="!showPwd" viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  <svg *ngIf="showPwd" viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2z"/></svg>
                </button>
              </div>
            </div>

            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="remember" name="remember">
              <span>Se souvenir de moi pendant 30 jours</span>
            </label>

            <button type="submit" class="btn-login" [disabled]="loading">
              <span *ngIf="!loading">Se connecter</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
          </form>

          <p class="signup-link">
            Vous n'avez pas encore de compte ?
            <a routerLink="/register">Inscrivez votre paroisse</a>
          </p>
        </div>
      </div>

      <div class="help-fab">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
        Besoin d'aide ?
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      min-height: 100vh;
    }

    .login-left {
      flex: 0 0 42%;
      background: linear-gradient(135deg, #1a1a2e 0%, #1e3a5f 50%, #1a1a2e 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px;
      position: relative;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -30%;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.08);
      }
      &::after {
        content: '';
        position: absolute;
        bottom: -30%;
        left: -20%;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.05);
      }
    }

    .left-content { position: relative; z-index: 1; }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 60px;
    }
    .brand-icon {
      width: 42px;
      height: 42px;
      background: var(--primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name { font-size: 18px; font-weight: 700; }

    .login-left h1 {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.2;
      color: #fff;
      margin-bottom: 16px;
      max-width: 380px;
    }

    .subtitle {
      font-size: 15px;
      color: rgba(255,255,255,0.7);
      line-height: 1.7;
      margin-bottom: 40px;
      max-width: 400px;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: rgba(255,255,255,0.85);
    }
    .feature-check {
      width: 28px;
      height: 28px;
      background: rgba(34, 197, 94, 0.15);
      color: #22C55E;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .left-footer {
      position: relative;
      z-index: 1;
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      a { color: rgba(255,255,255,0.6); &:hover { color: #fff; } }
      .sep { margin: 0 8px; }
    }

    .login-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--white);
    }

    .form-wrapper {
      width: 100%;
      max-width: 420px;
      h2 { font-size: 26px; font-weight: 800; color: var(--gray-900); margin-bottom: 8px; }
      .form-desc { font-size: 15px; color: var(--gray-500); margin-bottom: 32px; }
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
      input {
        width: 100%;
        padding: 12px 14px 12px 42px;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-sm);
        font-size: 14px;
        color: var(--gray-800);
        background: var(--white);
        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        &::placeholder { color: var(--gray-400); }
      }
      svg:first-child {
        position: absolute;
        left: 14px;
        z-index: 1;
      }
    }

    .toggle-pwd {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .forgot-link {
      font-size: 13px;
      color: var(--primary);
      font-weight: 500;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
      font-size: 14px;
      color: var(--gray-600);
      cursor: pointer;
      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: var(--primary);
      }
    }

    .btn-login {
      width: 100%;
      padding: 13px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: var(--font-family);
      transition: all 0.15s;
      &:hover { background: var(--primary-hover); }
      &:disabled { opacity: 0.6; }
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .signup-link {
      text-align: center;
      font-size: 14px;
      color: var(--gray-500);
      margin-top: 24px;
      a { font-weight: 600; }
    }

    .error-msg {
      background: var(--red-light);
      color: var(--red);
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      margin-bottom: 20px;
      border: 1px solid #fecaca;
    }

    .help-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--primary);
      color: #fff;
      padding: 10px 18px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: var(--shadow-lg);
      z-index: 100;
      &:hover { background: var(--primary-hover); }
    }

    @media (max-width: 900px) {
      .login-page { flex-direction: column; }
      .login-left { flex: none; padding: 32px 24px; }
      .login-left h1 { font-size: 24px; }
      .features { display: none; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  showPwd = false;
  remember = false;
  error = '';
  loading = false;
  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) router.navigate(['/app/dashboard']);
  }

  onLogin() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Email ou mot de passe incorrect';
      }
    });
  }
}
