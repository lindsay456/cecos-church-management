import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

interface StatCard {
  label: string;
  value: string;
  trend: string;
  trendClass: string;
  bg: string;
  color: string;
  icon: string;
}

interface AgeRow {
  label: string;
  pct: number;
  color: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Suivi des Presences</h2>
        <p class="page-desc">Gerez la participation aux cultes et analysez les tendances.</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary">Exporter Rapport</button>
        <button class="btn-primary" (click)="openForm()">+ Saisir Presences</button>
      </div>
    </div>

    <div class="error-banner" *ngIf="error">
      <span>{{ error }}</span>
      <button class="btn-secondary" (click)="load()">Reessayer</button>
    </div>

    <div class="loading-block" *ngIf="loading">
      <div class="spinner"></div>
      <p>Chargement des presences...</p>
    </div>

    <ng-container *ngIf="!loading">
      <div class="stats-row">
        <div class="mini-stat" *ngFor="let s of stats">
          <div class="mini-stat-info">
            <span class="mini-label">{{ s.label }}</span>
            <span class="mini-value">{{ s.value }}</span>
            <span class="mini-trend" [class]="s.trendClass">{{ s.trend }}</span>
          </div>
          <div class="mini-icon" [style.background]="s.bg">
            <svg viewBox="0 0 24 24" width="22" height="22" [attr.fill]="s.color" [innerHTML]="s.icon"></svg>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="main-col">
          <div class="card">
            <div class="card-header">
              <div>
                <h3>Journal de Presence</h3>
                <p class="card-subtitle">{{ lastSession ? (lastSession.date | date:'fullDate') : 'Historique des cultes' }}</p>
              </div>
              <div class="header-search">
                <input type="text" placeholder="Rechercher..." class="form-input" [(ngModel)]="searchTerm" name="searchTerm">
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Chapelle</th>
                  <th>Hommes</th>
                  <th>Femmes</th>
                  <th>Enfants</th>
                  <th>Visiteurs</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredSessions">
                  <td><strong>{{ s.date | date:'dd/MM/yyyy' }}</strong></td>
                  <td>{{ typeLabel(s.service_type) }}</td>
                  <td>{{ s.chapel_name || 'Toutes' }}</td>
                  <td>{{ s.men_count }}</td>
                  <td>{{ s.women_count }}</td>
                  <td>{{ s.children_count }}</td>
                  <td>{{ s.visitors_count }}</td>
                  <td><span class="badge badge-total">{{ s.total_count }}</span></td>
                </tr>
                <tr *ngIf="!filteredSessions.length">
                  <td colspan="8" class="empty-cell">Aucune session de culte enregistree.</td>
                </tr>
              </tbody>
            </table>

            <div class="pagination">
              <span>Affichage de {{ filteredSessions.length }} sur {{ count }} sessions</span>
              <div class="page-buttons">
                <button class="btn-secondary" [disabled]="!previousUrl" (click)="goTo(previousUrl)">Precedent</button>
                <button class="btn-secondary" [disabled]="!nextUrl" (click)="goTo(nextUrl)">Suivant</button>
              </div>
            </div>
          </div>
        </div>

        <div class="side-col">
          <div class="card">
            <h3>Dernier Evenement</h3>
            <p class="event-subtitle">{{ lastSession ? typeLabel(lastSession.service_type) : 'Aucun evenement' }}</p>
            <div class="event-detail" *ngIf="lastSession">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--primary)"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
              <div>
                <strong>{{ lastSession.date | date:'dd MMMM yyyy' }}</strong>
                <span>{{ lastSession.total_count }} presents</span>
              </div>
            </div>
            <div class="event-detail" *ngIf="lastSession">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--primary)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              <div>
                <strong>{{ lastSession.church_name || 'Eglise' }}</strong>
                <span>{{ lastSession.chapel_name || 'Toutes les chapelles' }}</span>
              </div>
            </div>

            <h4 class="section-title">Repartition dernier culte</h4>
            <div class="age-bars">
              <div class="age-row" *ngFor="let a of ageData">
                <span class="age-label">{{ a.label }}</span>
                <div class="age-bar"><div class="age-fill" [style.width]="a.pct + '%'" [style.background]="a.color"></div></div>
                <span class="age-pct">{{ a.pct }}%</span>
              </div>
              <p class="empty-hint" *ngIf="!ageData.length">Aucune donnee disponible.</p>
            </div>
          </div>

          <div class="card">
            <h3>Alertes de Participation</h3>
            <div class="alert-item">
              <div class="alert-icon red"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg></div>
              <div>
                <strong>Baisse de participation</strong>
                <p>Groupe "Jeunesse" : -15% aujourd'hui.</p>
              </div>
            </div>
            <div class="alert-item">
              <div class="alert-icon green"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg></div>
              <div>
                <strong>Nouveau record</strong>
                <p>Culte du soir : 120 presents.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Saisir Presences</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group">
              <label>Type de culte *</label>
              <select [(ngModel)]="form.service_type" name="service_type" required>
                <option *ngFor="let t of serviceTypes" [value]="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="form.date" name="date" required>
            </div>
          </div>
          <div class="form-group">
            <label>Chapelle</label>
            <select [(ngModel)]="form.chapel" name="chapel">
              <option value="">Toutes les chapelles</option>
              <option *ngFor="let c of chapels" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Hommes</label><input type="number" min="0" [(ngModel)]="form.men_count" name="men_count"></div>
            <div class="form-group"><label>Femmes</label><input type="number" min="0" [(ngModel)]="form.women_count" name="women_count"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Enfants</label><input type="number" min="0" [(ngModel)]="form.children_count" name="children_count"></div>
            <div class="form-group"><label>Visiteurs</label><input type="number" min="0" [(ngModel)]="form.visitors_count" name="visitors_count"></div>
          </div>
          <p class="form-error" *ngIf="formError">{{ formError }}</p>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-desc { font-size: 14px; color: var(--gray-500); margin: 4px 0 0; }
    .header-actions { display: flex; gap: 12px; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .mini-stat { background: var(--white); border: 1px solid var(--gray-100); border-radius: var(--radius); padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm); }
    .mini-label { display: block; font-size: 12px; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; }
    .mini-value { display: block; font-size: 28px; font-weight: 800; color: var(--gray-900); margin: 4px 0; }
    .mini-trend { font-size: 12px; font-weight: 600; &.up { color: var(--green); } &.down { color: var(--red); } }
    .mini-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .error-banner { display: flex; justify-content: space-between; align-items: center; gap: 12px; background: var(--red-light, #FEF2F2); color: var(--red, #DC2626); border: 1px solid var(--red, #DC2626); border-radius: var(--radius); padding: 12px 16px; margin-bottom: 20px; font-size: 14px; font-weight: 600; }

    .loading-block { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 16px; p { font-size: 14px; color: var(--gray-500); } }
    .spinner { width: 36px; height: 36px; border: 4px solid var(--gray-100); border-top-color: var(--primary, #2563EB); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
    .card { background: var(--white); border: 1px solid var(--gray-100); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h3 { margin: 0; font-size: 16px; } .card-subtitle { font-size: 13px; color: var(--gray-400); margin: 2px 0 0; text-transform: capitalize; } }
    .header-search input { max-width: 200px; }
    .data-table { width: 100%; border-collapse: collapse; th { background: var(--gray-50); padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; } td { padding: 12px 14px; border-top: 1px solid var(--gray-50); font-size: 14px; } }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge-total { background: #EFF6FF; color: #2563EB; }
    .empty-cell { text-align: center; color: var(--gray-400); padding: 32px 14px !important; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--gray-100); font-size: 13px; color: var(--gray-500); }
    .page-buttons { display: flex; gap: 8px; }

    .event-subtitle { font-size: 13px; color: var(--gray-400); margin: 4px 0 16px; }
    .event-detail { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--gray-50); strong { display: block; font-size: 14px; } span { font-size: 12px; color: var(--gray-400); } }
    .section-title { font-size: 14px; font-weight: 600; margin: 20px 0 12px; }
    .age-bars { display: flex; flex-direction: column; gap: 10px; }
    .age-row { display: flex; align-items: center; gap: 10px; }
    .age-label { width: 70px; font-size: 13px; color: var(--gray-600); }
    .age-bar { flex: 1; height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
    .age-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
    .age-pct { width: 40px; text-align: right; font-size: 13px; font-weight: 600; color: var(--gray-700); }
    .empty-hint { font-size: 13px; color: var(--gray-400); margin: 0; }

    .alert-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid var(--gray-50); &:last-child { border: none; } }
    .alert-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; &.red { background: var(--red-light); color: var(--red); } &.green { background: var(--green-light); color: var(--green); } }
    .alert-item strong { font-size: 13px; display: block; } .alert-item p { font-size: 12px; color: var(--gray-400); margin: 2px 0 0; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--white); border-radius: var(--radius); padding: 24px; width: 100%; max-width: 520px; box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.15)); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h3 { margin: 0; font-size: 18px; } }
    .btn-close { background: none; border: none; font-size: 24px; line-height: 1; cursor: pointer; color: var(--gray-400); }
    .form-row { display: flex; gap: 12px; margin-bottom: 14px; }
    .form-group { flex: 1; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-100); border-radius: 8px; font-size: 14px; box-sizing: border-box; &:focus { outline: none; border-color: var(--primary, #2563EB); } } }
    .form-error { color: var(--red, #DC2626); font-size: 13px; margin: 0 0 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; button:disabled { opacity: 0.6; cursor: not-allowed; } }

    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } .stats-row { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AttendanceComponent implements OnInit {
  loading = true;
  saving = false;
  error = '';
  formError = '';
  showForm = false;
  searchTerm = '';

  sessions: any[] = [];
  sortedSessions: any[] = [];
  stats: StatCard[] = [];
  ageData: AgeRow[] = [];
  lastSession: any = null;
  chapels: any[] = [];

  count = 0;
  nextUrl: string | null = null;
  previousUrl: string | null = null;

  serviceTypes = [
    { value: 'SABBATH', label: 'Sabbat' },
    { value: 'SUNDAY', label: 'Dimanche' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'FRIDAY', label: 'Vendredi' },
    { value: 'SPECIAL', label: 'Special' },
    { value: 'OTHER', label: 'Autre' },
  ];

  form: any = this.emptyForm();

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.api.getChapels().subscribe({ next: (res: any) => this.chapels = res.results || res || [] });
  }

  load(page?: number) {
    this.loading = true;
    this.error = '';
    const params: any = {};
    if (page) params.page = page;
    this.api.getWorshipSessions(params).subscribe({
      next: (res: any) => {
        this.sessions = res?.results || res || [];
        this.count = res?.count ?? this.sessions.length;
        this.nextUrl = res?.next || null;
        this.previousUrl = res?.previous || null;
        this.computeStats();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Erreur lors du chargement des presences.';
        this.loading = false;
      }
    });
  }

  goTo(url: string | null) {
    if (!url) return;
    const query = url.split('?')[1] || '';
    const page = Number(new URLSearchParams(query).get('page')) || 1;
    this.load(page);
  }

  computeStats() {
    this.sortedSessions = [...this.sessions].sort(
      (a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0)
    );
    this.lastSession = this.sortedSessions[0] || null;

    const totals = this.sortedSessions.map(s => Number(s.total_count) || 0);
    const visitors = this.sortedSessions.reduce((sum, s) => sum + (Number(s.visitors_count) || 0), 0);
    const avg = totals.length ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;

    let presenceTrend = 'Aucune donnee';
    let presenceTrendClass = '';
    if (totals.length > 1 && totals[1] > 0) {
      const diff = Math.round(((totals[0] - totals[1]) / totals[1]) * 100);
      presenceTrend = `${diff >= 0 ? '+' : ''}${diff}% vs culte precedent`;
      presenceTrendClass = diff >= 0 ? 'up' : 'down';
    }

    this.stats = [
      { label: "Presents au dernier culte", value: String(totals[0] || 0), trend: presenceTrend, trendClass: presenceTrendClass, bg: '#EFF6FF', color: '#2563EB', icon: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>' },
      { label: 'Moyenne par culte', value: String(avg), trend: `${this.count} cultes enregistres`, trendClass: 'up', bg: '#F0FDF4', color: '#16A34A', icon: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>' },
      { label: 'Total Visiteurs', value: String(visitors), trend: 'Toutes periodes confondues', trendClass: 'up', bg: '#FDF4FF', color: '#9333EA', icon: '<path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>' },
      { label: 'Cultes enregistres', value: String(this.count), trend: 'Historique complet', trendClass: 'up', bg: '#FFF7ED', color: '#EA580C', icon: '<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>' },
    ];

    if (this.lastSession) {
      const men = Number(this.lastSession.men_count) || 0;
      const women = Number(this.lastSession.women_count) || 0;
      const children = Number(this.lastSession.children_count) || 0;
      const base = men + women + children;
      const pct = (v: number) => (base ? Math.round((v / base) * 100) : 0);
      this.ageData = [
        { label: 'Hommes', pct: pct(men), color: '#2563EB' },
        { label: 'Femmes', pct: pct(women), color: '#16A34A' },
        { label: 'Enfants', pct: pct(children), color: '#EA580C' },
      ];
    } else {
      this.ageData = [];
    }
  }

  get filteredSessions() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.sortedSessions;
    return this.sortedSessions.filter(s =>
      this.typeLabel(s.service_type).toLowerCase().includes(term) ||
      (s.date || '').toLowerCase().includes(term) ||
      (s.church_name || '').toLowerCase().includes(term) ||
      (s.chapel_name || '').toLowerCase().includes(term)
    );
  }

  typeLabel(type: string): string {
    const found = this.serviceTypes.find(t => t.value === type);
    return found ? found.label : type;
  }

  openForm() {
    this.formError = '';
    this.form = this.emptyForm();
    this.showForm = true;
  }

  save() {
    if (this.saving) return;
    this.saving = true;
    this.formError = '';
    const payload = {
      service_type: this.form.service_type,
      date: this.form.date,
      chapel: this.form.chapel || null,
      men_count: Number(this.form.men_count) || 0,
      women_count: Number(this.form.women_count) || 0,
      children_count: Number(this.form.children_count) || 0,
      visitors_count: Number(this.form.visitors_count) || 0,
    };
    this.api.createWorshipSession(payload).subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.load();
        this.toast.success('Presence enregistree');
      },
      error: (err) => {
        this.saving = false;
        const apiErr = err?.error;
        let msg = apiErr?.detail || '';
        if (!msg && apiErr && typeof apiErr === 'object') {
          msg = Object.keys(apiErr)
            .map(k => `${k}: ${Array.isArray(apiErr[k]) ? apiErr[k].join(', ') : apiErr[k]}`)
            .join(' | ');
        }
        this.formError = msg || "Erreur lors de l'enregistrement.";
      }
    });
  }

  private emptyForm() {
    return {
      service_type: 'WORSHIP',
      date: new Date().toISOString().substring(0, 10),
      chapel: '',
      men_count: 0,
      women_count: 0,
      children_count: 0,
      visitors_count: 0,
    };
  }
}
