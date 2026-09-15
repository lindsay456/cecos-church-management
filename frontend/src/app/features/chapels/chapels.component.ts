import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-chapels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Chapelles / Paroisses</h2>
        <p class="page-subtitle">Gerez les lieux de culte rattaches a votre eglise</p>
      </div>
      <button class="btn-primary" (click)="openForm()">+ Nouvelle chapelle</button>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (keyup.enter)="filterList()" placeholder="Rechercher..." class="search-input">
      </div>
      <select [(ngModel)]="filterStatus" (change)="filterList()">
        <option value="">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
      </select>
    </div>

    <div class="cards-grid">
      <div class="card-item" *ngFor="let c of filtered" (click)="viewDetail(c)">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--primary)"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16z"/><path d="M12 6l-4 4h2v4h4v-4h2l-4-4z"/></svg>
        </div>
        <div class="card-info">
          <h4>{{ c.name }}</h4>
          <p><code>{{ c.code }}</code></p>
          <p>{{ c.address || c.city || '-' }}</p>
          <div class="card-meta">
            <span class="members-count">{{ c.members_count || 0 }} membres</span>
            <span class="badge" [class.inactive]="!c.is_active">{{ c.is_active ? 'Actif' : 'Inactif' }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-icon" (click)="openForm(c); $event.stopPropagation()" title="Modifier">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
          <button class="btn-icon btn-danger" (click)="deleteChapel(c); $event.stopPropagation()" title="Supprimer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--gray-300)"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16z"/></svg>
      <h3>Aucune chapelle</h3>
      <p>Commencez par ajouter une chapelle ou paroisse.</p>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Modifier la chapelle' : 'Nouvelle chapelle' }}</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group"><label>Nom *</label><input [(ngModel)]="form.name" name="name" required placeholder="Nom de la chapelle"></div>
            <div class="form-group"><label>Code *</label><input [(ngModel)]="form.code" name="code" required placeholder="Ex: CH001"></div>
          </div>
          <div class="form-group"><label>Eglise mere *</label>
            <select [(ngModel)]="form.church" name="church" required>
              <option value="">Selectionner...</option>
              <option *ngFor="let e of entities" [value]="e.id">{{ e.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Adresse</label><input [(ngModel)]="form.address" name="address" placeholder="Adresse complete"></div>
            <div class="form-group"><label>Quartier</label><input [(ngModel)]="form.neighborhood" name="neighborhood"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Ville</label><input [(ngModel)]="form.city" name="city"></div>
            <div class="form-group"><label>Pays</label><input [(ngModel)]="form.country" name="country" placeholder="Cameroun"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Telephone</label><input [(ngModel)]="form.phone" name="phone" placeholder="+237 6XX XXX XXX"></div>
            <div class="form-group"><label>Capacite</label><input type="number" [(ngModel)]="form.capacity" name="capacity" min="0"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Latitude</label><input type="number" step="any" [(ngModel)]="form.gps_lat" name="gps_lat"></div>
            <div class="form-group"><label>Longitude</label><input type="number" step="any" [(ngModel)]="form.gps_lng" name="gps_lng"></div>
          </div>
          <div class="form-group"><label>Horaires de culte</label><input [(ngModel)]="form.worship_schedule" name="worship_schedule" placeholder="Ex: Dimanche 9h, Mercredi 18h"></div>
          <div class="form-group"><label>Responsable</label>
            <select [(ngModel)]="form.leader" name="leader">
              <option value="">Selectionner...</option>
              <option *ngFor="let u of users" [value]="u.id">{{ u.first_name }} {{ u.last_name }}</option>
            </select>
          </div>
          <div class="form-group"><label>Observations</label><textarea [(ngModel)]="form.observations" name="observations" rows="3" placeholder="Notes ou observations..."></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ editing ? 'Enregistrer' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal-overlay" *ngIf="detailItem" (click)="detailItem = null">
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ detailItem.name }}</h3>
          <button class="btn-close" (click)="detailItem = null">&times;</button>
        </div>
        <div class="detail-grid">
          <div class="detail-section">
            <h4>Informations</h4>
            <div class="detail-row"><span class="detail-label">Code</span><span>{{ detailItem.code }}</span></div>
            <div class="detail-row"><span class="detail-label">Adresse</span><span>{{ detailItem.address || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Ville</span><span>{{ detailItem.city || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Quartier</span><span>{{ detailItem.neighborhood || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Pays</span><span>{{ detailItem.country || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Telephone</span><span>{{ detailItem.phone || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Capacite</span><span>{{ detailItem.capacity || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Statut</span><span class="badge" [class.inactive]="!detailItem.is_active">{{ detailItem.is_active ? 'Actif' : 'Inactif' }}</span></div>
          </div>
          <div class="detail-section">
            <h4>Culte & Responsabilite</h4>
            <div class="detail-row"><span class="detail-label">Horaires</span><span>{{ detailItem.worship_schedule || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Responsable</span><span>{{ detailItem.leader_name || '-' }}</span></div>
            <div class="detail-row"><span class="detail-label">Membres</span><span>{{ detailItem.members_count || 0 }}</span></div>
            <div class="detail-row" *ngIf="detailItem.gps_lat"><span class="detail-label">GPS</span><span>{{ detailItem.gps_lat }}, {{ detailItem.gps_lng }}</span></div>
            <div class="detail-obs" *ngIf="detailItem.observations">
              <span class="detail-label">Observations</span>
              <p>{{ detailItem.observations }}</p>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" (click)="detailItem = null">Fermer</button>
          <button class="btn-primary" (click)="detailItem = null; openForm(detailItem)">Modifier</button>
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

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .card-item { background: var(--white); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); display: flex; gap: 16px; cursor: pointer; transition: box-shadow 0.2s; position: relative;
      &:hover { box-shadow: var(--shadow); }
    }
    .card-icon { flex-shrink: 0; width: 48px; height: 48px; background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .card-info { flex: 1; min-width: 0;
      h4 { margin: 0 0 4px; font-size: 15px; color: var(--gray-900); }
      p { margin: 2px 0; font-size: 13px; color: var(--gray-400); }
      code { font-size: 12px; color: var(--primary); background: var(--primary-light); padding: 2px 6px; border-radius: 4px; }
    }
    .card-meta { display: flex; gap: 12px; align-items: center; margin-top: 6px; }
    .members-count { color: var(--primary); font-weight: 600; font-size: 13px; }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; background: #DCFCE7; color: #166534;
      &.inactive { background: var(--gray-100); color: var(--gray-500); }
    }
    .card-actions { position: absolute; top: 12px; right: 12px; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 4px; color: var(--gray-400); border-radius: 4px;
      &:hover { background: var(--gray-100); color: var(--primary); }
      &.btn-danger:hover { background: #FEE2E2; color: #DC2626; }
    }

    .btn-primary { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: var(--primary-hover); }
      &:disabled { opacity: 0.6; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-400); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius); padding: 28px; width: 100%; max-width: 580px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-lg { max-width: 720px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h3 { margin: 0; font-size: 20px; color: var(--gray-900); }
    }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .form-row { display: flex; gap: 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-100); }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 8px; }
    .detail-section h4 { font-size: 14px; color: var(--gray-500); margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--gray-100); }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid var(--gray-50);
      .detail-label { color: var(--gray-500); font-size: 13px; }
    }
    .detail-obs { margin-top: 12px;
      .detail-label { display: block; color: var(--gray-500); font-size: 13px; margin-bottom: 4px; }
      p { margin: 0; font-size: 14px; color: var(--gray-700); white-space: pre-wrap; }
    }

    .empty-state { text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .filters-bar { flex-direction: column; }
      .cards-grid { grid-template-columns: 1fr; }
      .form-row { flex-direction: column; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ChapelsComponent implements OnInit {
  chapels: any[] = [];
  filtered: any[] = [];
  entities: any[] = [];
  users: any[] = [];
  search = '';
  filterStatus = '';
  loading = false;
  showForm = false;
  saving = false;
  editing = false;
  editId = 0;
  detailItem: any = null;
  form: any = this.getEmptyForm();

  constructor(private api: ApiService, private toast: ToastService, private confirm: ConfirmService) {}

  ngOnInit() {
    this.load();
    this.api.getEntities().subscribe({ next: (res: any) => this.entities = res.results || res || [] });
    this.api.getUsers().subscribe({ next: (res: any) => this.users = res.results || res || [] });
  }

  getEmptyForm() {
    return { name: '', code: '', church: '', address: '', neighborhood: '', city: '', country: '', phone: '', capacity: null, gps_lat: null, gps_lng: null, worship_schedule: '', leader: '', observations: '' };
  }

  load() {
    this.loading = true;
    this.api.getChapels().subscribe({
      next: (res: any) => { this.chapels = res.results || res || []; this.filterList(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.chapels.filter(c =>
      (!q || c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q)) &&
      (this.filterStatus === '' || (this.filterStatus === 'active' && c.is_active) || (this.filterStatus === 'inactive' && !c.is_active))
    );
  }

  openForm(c?: any) {
    if (c) {
      this.editing = true;
      this.editId = c.id;
      this.form = { name: c.name, code: c.code, church: c.church || '', address: c.address || '', neighborhood: c.neighborhood || '', city: c.city || '', country: c.country || '', phone: c.phone || '', capacity: c.capacity || null, gps_lat: c.gps_lat || null, gps_lng: c.gps_lng || null, worship_schedule: c.worship_schedule || '', leader: c.leader || '', observations: c.observations || '' };
    } else {
      this.editing = false;
      this.form = this.getEmptyForm();
    }
    this.showForm = true;
  }

  viewDetail(c: any) { this.detailItem = c; }

  async deleteChapel(c: any) {
    const ok = await this.confirm.confirm('Supprimer la chapelle', `Voulez-vous vraiment supprimer "${c.name}" ?`, { confirmText: 'Supprimer', type: 'danger' });
    if (!ok) return;
    this.api.deleteChapel(c.id).subscribe({
      next: () => { this.toast.success('Chapelle supprimee'); this.load(); },
      error: (err) => { this.toast.error(err.error?.detail || 'Impossible de supprimer cette chapelle'); }
    });
  }

  save() {
    this.saving = true;
    const obs = this.editing ? this.api.updateChapel(this.editId, this.form) : this.api.createChapel(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.editing = false; this.saving = false; this.load(); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }
}
