import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-families',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Familles</h2>
        <p class="page-subtitle">{{ families.length }} famille(s) au total</p>
      </div>
      <button class="btn-primary" (click)="openForm()">+ Nouvelle famille</button>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (keyup.enter)="filterList()" placeholder="Rechercher par nom ou code..." class="search-input">
      </div>
    </div>

    <div class="table-container" *ngIf="filtered.length">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Nom de la famille</th>
            <th>Chef de famille</th>
            <th>Email</th>
            <th>Membres</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let f of filtered">
            <td><span class="family-code">{{ f.family_code }}</span></td>
            <td><strong>{{ f.name }}</strong></td>
            <td>{{ f.household_head_name || '-' }}</td>
            <td>{{ f.main_email || '-' }}</td>
            <td><span class="member-count">{{ f.members_count || 0 }}</span></td>
            <td>
              <span class="badge" [ngClass]="f.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'">
                {{ f.status === 'ACTIVE' ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="actions-cell">
                <button class="btn-icon" (click)="viewFamily(f)" title="Voir">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                </button>
                <button class="btn-icon" (click)="openForm(f)" title="Modifier">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
                </button>
                <button class="btn-icon btn-archive" (click)="deactivateFamily(f)" title="Desactiver" *ngIf="f.status === 'ACTIVE'">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--gray-300)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      <h3>Aucune famille</h3>
      <p>Commencez par creer une famille.</p>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Modifier la famille' : 'Nouvelle famille' }}</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-group">
            <label>Nom de la famille *</label>
            <input [(ngModel)]="form.name" name="name" required placeholder="Ex: Famille Kamga">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email principale</label>
              <input type="email" [(ngModel)]="form.main_email" name="main_email" placeholder="prenom.nom@google.com">
            </div>
            <div class="form-group">
              <label>Telephone</label>
              <input [(ngModel)]="form.main_phone" name="main_phone" placeholder="+237 6XX XXX XXX">
            </div>
          </div>
          <div class="form-group">
            <label>Adresse</label>
            <input [(ngModel)]="form.address" name="address" placeholder="Adresse de la famille">
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="form.notes" name="notes" rows="3" placeholder="Informations complementaires..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ editing ? 'Enregistrer' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div class="modal-overlay" *ngIf="selectedFamily" (click)="selectedFamily = null">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedFamily.name }}</h3>
          <button class="btn-close" (click)="selectedFamily = null">&times;</button>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><span class="detail-label">Code</span><span>{{ selectedFamily.family_code }}</span></div>
          <div class="detail-item"><span class="detail-label">Nom</span><span>{{ selectedFamily.name }}</span></div>
          <div class="detail-item"><span class="detail-label">Chef de famille</span><span>{{ selectedFamily.household_head_name || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Email</span><span>{{ selectedFamily.main_email || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Telephone</span><span>{{ selectedFamily.main_phone || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Adresse</span><span>{{ selectedFamily.address || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Nombre de membres</span><span>{{ selectedFamily.members_count || 0 }}</span></div>
          <div class="detail-item"><span class="detail-label">Statut</span><span class="badge" [ngClass]="selectedFamily.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'">{{ selectedFamily.status === 'ACTIVE' ? 'Active' : 'Inactive' }}</span></div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" (click)="selectedFamily = null">Fermer</button>
          <button class="btn-primary" (click)="openForm(selectedFamily); selectedFamily = null">Modifier</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 22px; color: var(--gray-900); }
      .page-subtitle { font-size: 13px; color: var(--gray-400); margin: 2px 0 0; }
    }
    .filters-bar { margin-bottom: 16px; }
    .search-box { display: flex; align-items: center; gap: 8px; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 10px 14px;
      svg { flex-shrink: 0; }
      .search-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: var(--font-family); }
    }
    .table-container { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; border: 1px solid var(--gray-100); }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--gray-50); padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--gray-100); }
    td { padding: 12px 16px; border-bottom: 1px solid var(--gray-50); font-size: 14px; color: var(--gray-700); }
    tr:hover { background: var(--gray-50); }
    .family-code { font-family: monospace; font-size: 13px; color: var(--primary); font-weight: 600; }
    .member-count { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; background: var(--primary-light); color: var(--primary); border-radius: 12px; font-size: 13px; font-weight: 700; }
    .actions-cell { display: flex; gap: 4px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-active { background: #DCFCE7; color: #166534; }
    .badge-inactive { background: var(--gray-100); color: var(--gray-500); }
    .btn-primary { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: var(--primary-hover); }
      &:disabled { opacity: 0.6; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--gray-500); display: inline-flex; align-items: center;
      &:hover { background: var(--gray-100); color: var(--gray-700); }
      &.btn-archive:hover { background: #FEF3C7; color: #92400E; }
    }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius); padding: 28px; width: 100%; max-width: 560px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h3 { margin: 0; font-size: 20px; color: var(--gray-900); }
    }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-400); }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .form-row { display: flex; gap: 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-100); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; padding: 10px 0; border-bottom: 1px solid var(--gray-50); }
    .detail-label { font-size: 12px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; }
    .empty-state { text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }
    @media (max-width: 768px) { .form-row { flex-direction: column; } .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class FamiliesComponent implements OnInit {
  families: any[] = [];
  filtered: any[] = [];
  search = '';
  loading = false;
  showForm = false;
  saving = false;
  editing: any = null;
  selectedFamily: any = null;
  form: any = { name: '', main_email: '', main_phone: '', address: '', notes: '' };

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getFamilies().subscribe({
      next: (res: any) => { this.families = res.results || res || []; this.filterList(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.families.filter(f => !q || f.name.toLowerCase().includes(q) || f.family_code.toLowerCase().includes(q));
  }

  openForm(family?: any) {
    this.editing = family || null;
    this.form = family ? { ...family } : { name: '', main_email: '', main_phone: '', address: '', notes: '' };
    this.showForm = true;
  }

  viewFamily(f: any) { this.selectedFamily = f; }

  save() {
    this.saving = true;
    const req = this.editing
      ? this.api.updateFamily(this.editing.id, this.form)
      : this.api.createFamily(this.form);
    req.subscribe({
      next: () => { this.showForm = false; this.editing = null; this.saving = false; this.load(); },
      error: (err) => { this.saving = false; alert(err.error?.detail || 'Erreur'); }
    });
  }

  deactivateFamily(f: any) {
    if (confirm(`Voulez-vous desactiver la famille "${f.name}" ?`)) {
      this.api.updateFamily(f.id, { status: 'INACTIVE' }).subscribe({
        next: () => this.load(),
        error: (err) => alert(err.error?.detail || 'Erreur')
      });
    }
  }
}
