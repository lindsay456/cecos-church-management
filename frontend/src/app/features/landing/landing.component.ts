import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing">
      <nav class="navbar" [class.scrolled]="scrolled">
        <div class="nav-container">
          <div class="brand">
            <div class="brand-icon">
              <span class="material-icons">church</span>
            </div>
            <span class="brand-name">CECOS Church Management</span>
          </div>
          <div class="nav-links" [class.open]="menuOpen">
            <a href="#features">Fonctionnalites</a>
            <a href="#how">Comment ca marche</a>
            <a href="#security">Securite</a>
            <a href="#contact">Contact</a>
          </div>
          <div class="nav-actions">
            <a routerLink="/login" class="btn-ghost">Se connecter</a>
            <a routerLink="/register" class="btn-primary">
              <span class="material-icons">person_add</span>
              S'inscrire
            </a>
          </div>
          <button class="menu-toggle" (click)="menuOpen = !menuOpen">
            <span class="material-icons">{{ menuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </nav>

      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-container">
          <div class="hero-badge">
            <span class="material-icons" style="font-size:14px">auto_awesome</span>
            Solution de gestion ecclesiastique
          </div>
          <h1>Gerez votre Eglise avec <br><span class="gradient-text">simplicite</span>, <span class="gradient-text">transparence</span> et <span class="gradient-text">confiance</span>.</h1>
          <p class="hero-subtitle">La plateforme complete pour gerer membres, finances, presences et rapports. Adaptee a toutes les denominations.</p>
          <div class="hero-actions">
            <a routerLink="/register" class="btn-hero">
              <span class="material-icons">rocket_launch</span>
              Commencer maintenant
            </a>
            <a routerLink="/login" class="btn-hero-ghost">
              <span class="material-icons">login</span>
              Se connecter
            </a>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">20+</span>
              <span class="stat-label">Modules</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">100%</span>
              <span class="stat-label">Gratuit</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">16</span>
              <span class="stat-label">Roles</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="section features-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-badge">Fonctionnalites</span>
            <h2>Tout ce dont votre Eglise a besoin</h2>
            <p>Une suite complete d'outils pour gerer chaque aspect de votre communaute</p>
          </div>
          <div class="features-grid">
            <div class="feature-card" *ngFor="let f of features; let i = index" [style.--accent]="f.color">
              <div class="feature-icon" [style.background]="f.bg" [style.color]="f.color">
                <span class="material-icons">{{ f.icon }}</span>
              </div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.description }}</p>
              <div class="feature-glow" [style.background]="f.color"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" class="section how-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-badge">Comment ca marche</span>
            <h2>En 3 etapes simples</h2>
          </div>
          <div class="steps-grid">
            <div class="step-card" *ngFor="let s of steps; let i = index">
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-connector" *ngIf="i < 2"></div>
              <h3>{{ s.title }}</h3>
              <p>{{ s.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="security" class="section security-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-badge">Securite et confidentialite</span>
            <h2>Vos donnees sont protegees</h2>
            <p>Nous prenons la securite de vos donnees au serieux</p>
          </div>
          <div class="security-grid">
            <div class="security-card" *ngFor="let s of securityFeatures">
              <div class="security-icon-wrap">
                <span class="material-icons">{{ s.icon }}</span>
              </div>
              <h3>{{ s.title }}</h3>
              <p>{{ s.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" class="section cta-section">
        <div class="cta-bg"></div>
        <div class="section-container cta-container">
          <div class="cta-badge">
            <span class="material-icons" style="font-size:14px">auto_awesome</span>
            Rejoignez-nous
          </div>
          <h2>Pret a transformer la gestion de votre Eglise ?</h2>
          <p>Rejoignez les communautes qui font confiance a CECOS Church Management</p>
          <div class="cta-actions">
            <a routerLink="/register" class="btn-hero">
              <span class="material-icons">person_add</span>
              S'inscrire maintenant
            </a>
            <a routerLink="/login" class="btn-hero-ghost">
              <span class="material-icons">login</span>
              Se connecter
            </a>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-container">
          <div class="footer-brand">
            <div class="brand">
              <div class="brand-icon">
                <span class="material-icons">church</span>
              </div>
              <span class="brand-name">CECOS Church Management</span>
            </div>
            <p>La solution de gestion ecclesiastique au service des communautes de foi.</p>
          </div>
          <div class="footer-links">
            <h4>Plateforme</h4>
            <a href="#features">Fonctionnalites</a>
            <a href="#how">Comment ca marche</a>
            <a href="#security">Securite</a>
          </div>
          <div class="footer-links">
            <h4>Ressources</h4>
            <a href="#">Documentation</a>
            <a href="#">Support</a>
            <a href="#">Guide d'utilisation</a>
          </div>
          <div class="footer-links">
            <h4>Legal</h4>
            <a href="#">Confidentialite</a>
            <a href="#">Conditions d'utilisation</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2025 CECOS Church Management. Tous droits reserves.</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .landing {
      font-family: var(--font-family);
      color: var(--gray-800);
      overflow-x: hidden;
    }

    /* ── Navbar ── */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(0,0,0,0.06);
      transition: all 0.3s;
      &.scrolled { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    }
    .nav-container {
      max-width: 1200px; margin: 0 auto; padding: 12px 28px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .brand-icon {
      width: 34px; height: 34px; background: linear-gradient(135deg, var(--primary), #6366f1);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(37,99,235,0.3);
      .material-icons { color: #fff; font-size: 18px; }
    }
    .brand-name { font-size: 15px; font-weight: 700; color: var(--gray-900); letter-spacing: -0.3px; }

    .nav-links { display: flex; gap: 4px; }
    .nav-links a {
      font-size: 13px; font-weight: 500; color: var(--gray-500); text-decoration: none;
      padding: 6px 14px; border-radius: 8px; transition: all 0.2s;
      &:hover { color: var(--primary); background: rgba(37,99,235,0.05); }
    }
    .nav-actions { display: flex; gap: 10px; align-items: center; }

    .btn-ghost {
      padding: 8px 16px; font-size: 13px; font-weight: 500; color: var(--gray-600);
      text-decoration: none; border-radius: 8px; transition: all 0.2s;
      &:hover { background: rgba(0,0,0,0.04); color: var(--gray-900); }
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 18px; background: linear-gradient(135deg, var(--primary), #6366f1);
      color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
      cursor: pointer; text-decoration: none; font-family: var(--font-family);
      transition: all 0.25s; box-shadow: 0 2px 8px rgba(37,99,235,0.3);
      &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(37,99,235,0.4); }
      .material-icons { font-size: 16px; }
    }
    .menu-toggle { display: none; background: none; border: none; cursor: pointer; padding: 4px; color: var(--gray-700); }

    /* ── Hero ── */
    .hero {
      padding: 120px 28px 64px; text-align: center; position: relative;
      background: linear-gradient(160deg, #020617 0%, #0f172a 40%, #1e293b 100%);
      color: #fff; overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 600px 400px at 20% 50%, rgba(37,99,235,0.12), transparent),
        radial-gradient(ellipse 500px 300px at 80% 30%, rgba(99,102,241,0.08), transparent),
        radial-gradient(ellipse 400px 250px at 50% 80%, rgba(14,165,233,0.06), transparent);
    }
    .hero-container { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 16px; background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.2); border-radius: 20px;
      font-size: 12px; font-weight: 600; color: #a5b4fc; margin-bottom: 20px;
      letter-spacing: 0.3px;
    }
    .hero h1 {
      font-size: 42px; font-weight: 800; line-height: 1.15; margin-bottom: 16px;
      color: #fff; letter-spacing: -0.5px;
    }
    .gradient-text {
      background: linear-gradient(135deg, #60a5fa, #a78bfa, #818cf8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.7;
      max-width: 560px; margin: 0 auto 28px;
    }
    .hero-actions { display: flex; gap: 12px; justify-content: center; margin-bottom: 40px; flex-wrap: wrap; }
    .btn-hero {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px; background: linear-gradient(135deg, #2563eb, #6366f1);
      color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
      cursor: pointer; text-decoration: none; font-family: var(--font-family);
      transition: all 0.25s; box-shadow: 0 4px 16px rgba(37,99,235,0.35);
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.45); }
      .material-icons { font-size: 18px; }
    }
    .btn-hero-ghost {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px; background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;
      text-decoration: none; font-family: var(--font-family); transition: all 0.25s;
      backdrop-filter: blur(8px);
      &:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); transform: translateY(-1px); }
      .material-icons { font-size: 18px; }
    }
    .hero-stats {
      display: flex; align-items: center; justify-content: center; gap: 28px; flex-wrap: wrap;
    }
    .stat-item { text-align: center; }
    .stat-number { display: block; font-size: 24px; font-weight: 800; color: #fff; }
    .stat-label { font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 500; }
    .stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.1); }

    /* ── Sections ── */
    .section { padding: 56px 28px; }
    .section-container { max-width: 1200px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 40px; }
    .section-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 14px; background: rgba(37,99,235,0.06);
      color: var(--primary); border-radius: 16px; font-size: 11px; font-weight: 600;
      margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .section-header h2 {
      font-size: 28px; font-weight: 800; color: var(--gray-900);
      margin-bottom: 10px; letter-spacing: -0.3px;
    }
    .section-header p { font-size: 15px; color: var(--gray-500); max-width: 520px; margin: 0 auto; }

    /* ── Features ── */
    .features-section { background: var(--bg-page); }
    .features-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
    }
    .feature-card {
      position: relative; background: var(--white); border-radius: 16px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.04); transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02);
        border-color: transparent;
        .feature-glow { opacity: 0.06; }
      }
      h3 { font-size: 14px; font-weight: 700; color: var(--gray-900); margin: 14px 0 6px; }
      p { font-size: 12.5px; color: var(--gray-500); line-height: 1.6; }
    }
    .feature-icon {
      width: 44px; height: 44px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center;
      .material-icons { font-size: 22px; }
    }
    .feature-glow {
      position: absolute; top: -40px; right: -40px; width: 120px; height: 120px;
      border-radius: 50%; opacity: 0; filter: blur(40px); transition: opacity 0.3s;
    }

    /* ── Steps ── */
    .how-section { background: var(--white); }
    .steps-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; position: relative;
    }
    .step-card {
      text-align: center; padding: 28px 20px; position: relative;
      background: var(--bg-page); border-radius: 16px;
      border: 1px solid rgba(0,0,0,0.04);
      transition: all 0.3s;
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
      h3 { font-size: 15px; font-weight: 700; color: var(--gray-900); margin: 14px 0 6px; }
      p { font-size: 13px; color: var(--gray-500); line-height: 1.6; }
    }
    .step-number {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #6366f1);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; margin: 0 auto;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    .step-connector {
      display: none;
      position: absolute; top: 50px; right: -30px;
      width: 60px; height: 2px; background: var(--gray-200);
    }

    /* ── Security ── */
    .security-section { background: var(--bg-page); }
    .security-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .security-card {
      background: var(--white); border-radius: 16px; padding: 24px;
      border: 1px solid rgba(0,0,0,0.04); transition: all 0.3s;
      &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
      h3 { font-size: 14px; font-weight: 700; color: var(--gray-900); margin: 14px 0 6px; }
      p { font-size: 12.5px; color: var(--gray-500); line-height: 1.6; }
    }
    .security-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px;
      background: rgba(37,99,235,0.06); display: flex;
      align-items: center; justify-content: center;
      .material-icons { font-size: 22px; color: var(--primary); }
    }

    /* ── CTA ── */
    .cta-section {
      padding: 56px 28px; position: relative; overflow: hidden;
      background: linear-gradient(160deg, #020617, #0f172a, #1e293b);
      text-align: center; color: #fff;
    }
    .cta-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 500px 300px at 30% 50%, rgba(37,99,235,0.1), transparent),
        radial-gradient(ellipse 400px 250px at 70% 60%, rgba(99,102,241,0.08), transparent);
    }
    .cta-container { position: relative; z-index: 1; }
    .cta-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 16px; background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.2); border-radius: 20px;
      font-size: 12px; font-weight: 600; color: #a5b4fc; margin-bottom: 16px;
    }
    .cta-section h2 {
      font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 10px;
      letter-spacing: -0.3px;
    }
    .cta-section p {
      font-size: 15px; color: rgba(255,255,255,0.6); margin-bottom: 24px;
    }
    .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    /* ── Footer ── */
    .footer { background: #0a0f1a; color: var(--gray-400); padding: 40px 28px 0; }
    .footer-container {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px;
    }
    .footer-brand {
      p { font-size: 13px; line-height: 1.7; margin-top: 10px; color: var(--gray-500); }
      .brand-name { color: #fff; font-size: 14px; }
      .brand-icon { width: 30px; height: 30px; }
    }
    .footer-links {
      h4 { font-size: 13px; font-weight: 600; color: var(--gray-300); margin-bottom: 12px; }
      a {
        display: block; font-size: 12.5px; color: var(--gray-500); text-decoration: none;
        padding: 3px 0; transition: color 0.2s;
        &:hover { color: #fff; }
      }
    }
    .footer-bottom {
      max-width: 1200px; margin: 28px auto 0; padding: 16px 0;
      border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 12px;
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-container { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .nav-links {
        display: none;
        &.open {
          display: flex; flex-direction: column; position: absolute; top: 100%;
          left: 0; right: 0; background: rgba(255,255,255,0.98);
          backdrop-filter: blur(20px); padding: 16px 28px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          a { padding: 10px 0; }
        }
      }
      .nav-actions { display: none; }
      .menu-toggle { display: block; }
      .hero { padding: 100px 20px 48px; }
      .hero h1 { font-size: 28px; }
      .hero-subtitle { font-size: 14px; }
      .hero-actions { flex-direction: column; align-items: center; }
      .features-grid { grid-template-columns: 1fr; }
      .steps-grid { grid-template-columns: 1fr; gap: 12px; }
      .step-connector { display: none; }
      .security-grid { grid-template-columns: 1fr; }
      .section { padding: 40px 20px; }
      .section-header h2 { font-size: 22px; }
      .footer-container { grid-template-columns: 1fr; gap: 24px; }
      .cta-actions { flex-direction: column; align-items: center; }
      .btn-hero, .btn-hero-ghost { width: 100%; justify-content: center; max-width: 280px; }
    }
  `]
})
export class LandingComponent {
  menuOpen = false;
  scrolled = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled = window.scrollY > 10;
      });
    }
  }

  features = [
    { icon: 'people', title: 'Membres et familles', description: 'Gerez les fiches de vos membres, familles, baptêmes et transferts.', bg: '#EFF6FF', color: '#2563EB' },
    { icon: 'meeting_room', title: 'Chapelles', description: 'Organisez vos chapelles, responsables et lieux de culte.', bg: '#F0FDF4', color: '#16A34A' },
    { icon: 'account_balance', title: 'Departements', description: 'Structurez vos ministères et deleguez les responsabilités.', bg: '#FDF4FF', color: '#9333EA' },
    { icon: 'event', title: 'Événements', description: 'Planifiez cultes, réunions, formations et activités.', bg: '#FFF7ED', color: '#EA580C' },
    { icon: 'check_circle', title: 'Présences', description: 'Enregistrez les présences par séance de culte et chapelle.', bg: '#FEF2F2', color: '#DC2626' },
    { icon: 'payments', title: 'Finances', description: 'Suivez recettes, dépenses, budgets et alertes.', bg: '#F0FDF4', color: '#16A34A' },
    { icon: 'volunteer_activism', title: 'Dîmes et offrandes', description: 'Enregistrez et validez les contributions avec reçus.', bg: '#FEF9C3', color: '#CA8A04' },
    { icon: 'bar_chart', title: 'Rapports', description: 'Générez des rapports PDF sur tous vos modules.', bg: '#EFF6FF', color: '#2563EB' },
  ];

  steps = [
    { title: 'Créez votre Eglise', description: 'Le Super Admin crée l\'Eglise et désigne le Responsable local.' },
    { title: 'Configurez votre équipe', description: 'Le Responsable crée les membres de son équipe avec leurs rôles.' },
    { title: 'Gérez au quotidien', description: 'Membres, finances, événements, présences — tout est centralisé.' },
  ];

  securityFeatures = [
    { icon: 'lock', title: 'Authentification JWT', description: 'Tokens sécurisés avec expiration automatique et rafraîchissement.' },
    { icon: 'verified_user', title: 'Contrôle d\'accès', description: 'Rôles et périmètres stricts. Chaque utilisateur ne voit que ses données.' },
    { icon: 'shield', title: 'Journal d\'audit', description: 'Toutes les actions sont tracées avec horodatage et utilisateur.' },
    { icon: 'cloud', title: 'Données protégées', description: 'Chiffrement des données sensibles et sauvegardes régulières.' },
    { icon: 'admin_panel_settings', title: 'Gestion des rôles', description: '16 rôles définis avec permissions granulaires et visibilité hiérarchique.' },
    { icon: 'security', title: 'Conformité RGPD', description: 'Consentements explicites et droit à l\'oubli pour vos membres.' },
  ];
}
