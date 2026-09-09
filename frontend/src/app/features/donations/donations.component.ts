import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Don, Member } from '../../core/models';
import { ROLES } from '../../core/constants/roles';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="header-left">
        <h2>{{ isMember ? 'Mes dons' : 'Dons et offrandes' }}</h2>
      </div>
      <div class="header-right">
        <button class="btn-outline" (click)="exportDonations()" *ngIf="!isMember">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Exporter
        </button>
        <button class="btn-primary btn-donate" (click)="openCreateModal()">
          <span class="material-icons" style="font-size:18px">volunteer_activism</span>
          {{ isMember ? 'Faire un don' : 'Enregistrer un don' }}
        </button>
      </div>
    </div>

    <!-- Stats Row (admin/treasurer only) -->
    <div class="stats-row" *ngIf="!isMember">
      <div class="stat-card">
        <span class="material-icons stat-icon">volunteer_activism</span>
        <div class="stat-info">
          <span class="stat-value">{{ totalDons }}</span>
          <span class="stat-label">Total dons</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon stat-validated">check_circle</span>
        <div class="stat-info">
          <span class="stat-value">{{ totalValidated | number }} FCFA</span>
          <span class="stat-label">Total valide</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon stat-pending">pending</span>
        <div class="stat-info">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">En attente</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon stat-donors">people</span>
        <div class="stat-info">
          <span class="stat-value">{{ donorCount }}</span>
          <span class="stat-label">Nombre de donneurs</span>
        </div>
      </div>
    </div>

    <!-- Member stats -->
    <div class="stats-row" *ngIf="isMember">
      <div class="stat-card">
        <span class="material-icons stat-icon">volunteer_activism</span>
        <div class="stat-info">
          <span class="stat-value">{{ totalDons }}</span>
          <span class="stat-label">Mes dons</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon stat-validated">check_circle</span>
        <div class="stat-info">
          <span class="stat-value">{{ myTotalValidated | number }} FCFA</span>
          <span class="stat-label">Total valide</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon stat-pending">pending</span>
        <div class="stat-info">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">En attente</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-bar">
        <span class="material-icons">search</span>
        <input type="text" placeholder="Rechercher un don..." [(ngModel)]="search" (input)="filterList()">
      </div>
      <select [(ngModel)]="filterType" (change)="filterList()" class="filter-select">
        <option value="">Tous les types</option>
        <option value="TITHE">Dime</option>
        <option value="GENERAL_OFFERING">Offrande generale</option>
        <option value="SPECIAL_OFFERING">Offrande speciale</option>
        <option value="DESIGNATED_FUND">Fonds designe</option>
        <option value="OTHER">Autre</option>
      </select>
      <select [(ngModel)]="filterStatus" (change)="filterList()" class="filter-select" *ngIf="!isMember">
        <option value="">Tous les statuts</option>
        <option value="DRAFT">Brouillon</option>
        <option value="PENDING_VALIDATION">En attente</option>
        <option value="VALIDATED">Valide</option>
        <option value="REJECTED">Rejete</option>
        <option value="CANCELLED">Annule</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-container" *ngIf="filtered.length">
      <table>
        <thead>
          <tr>
            <th>Numero</th>
            <th *ngIf="!isMember">Membre</th>
            <th>Type</th>
            <th>Montant</th>
            <th>Date</th>
            <th>Mode</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of filtered">
            <td><code>{{ d.donation_number }}</code></td>
            <td *ngIf="!isMember">{{ d.member_name || 'N/A' }}</td>
            <td>{{ typeLabel(d.donation_type) }}</td>
            <td><strong>{{ d.amount | number }} FCFA</strong></td>
            <td>{{ d.donation_date | date:'dd/MM/yyyy' }}</td>
            <td>{{ methodLabel(d.payment_method) }}</td>
            <td>
              <span class="badge" [ngClass]="{
                'badge-draft': d.status === 'DRAFT',
                'badge-pending': d.status === 'PENDING_VALIDATION',
                'badge-validated': d.status === 'VALIDATED',
                'badge-rejected': d.status === 'REJECTED',
                'badge-cancelled': d.status === 'CANCELLED'
              }">{{ statusLabel(d.status) }}</span>
            </td>
            <td class="actions">
              <button class="btn-icon btn-success" title="Valider"
                *ngIf="d.status === 'PENDING_VALIDATION' && !isMember"
                [disabled]="processingId === d.id"
                (click)="validate(d.id)">
                <span class="material-icons">check</span>
              </button>
              <button class="btn-icon btn-danger" title="Rejeter"
                *ngIf="d.status === 'PENDING_VALIDATION' && !isMember"
                [disabled]="processingId === d.id"
                (click)="openRejectModal(d)">
                <span class="material-icons">close</span>
              </button>
              <button class="btn-icon btn-info" title="Telecharger recu"
                *ngIf="d.status === 'VALIDATED'"
                (click)="downloadReceipt(d.id)">
                <span class="material-icons">receipt</span>
              </button>
              <button class="btn-icon btn-warning" title="Annuler"
                *ngIf="(d.status === 'DRAFT' || d.status === 'PENDING_VALIDATION') && !isMember"
                [disabled]="processingId === d.id"
                (click)="openCancelModal(d)">
                <span class="material-icons">cancel</span>
              </button>
              <button class="btn-icon" title="Modifier"
                *ngIf="(d.status === 'DRAFT' || d.status === 'PENDING_VALIDATION') && !isMember"
                (click)="openEditModal(d)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-icon btn-danger" title="Supprimer"
                *ngIf="d.status === 'DRAFT' && !isMember"
                (click)="openDeleteModal(d)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="empty-state" *ngIf="!loading && !filtered.length">
      <span class="material-icons empty-icon">volunteer_activism</span>
      <h3>{{ isMember ? 'Vous navez pas encore fait de don' : 'Aucun don enregistre' }}</h3>
      <p>{{ isMember ? 'Soutenez votre eglise en faisant un don.' : 'Commencez par enregistrer un don.' }}</p>
      <button class="btn-primary" style="margin-top:16px" (click)="openCreateModal()">
        <span class="material-icons" style="font-size:18px">volunteer_activism</span>
        {{ isMember ? 'Faire un don' : 'Enregistrer un don' }}
      </button>
    </div>

    <div class="loading-state" *ngIf="loading">
      <span class="material-icons spinning">refresh</span>
      <p>Chargement...</p>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showFormModal" (click)="closeFormModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingDon ? 'Modifier le don' : (isMember ? 'Faire un don' : 'Enregistrer un don') }}</h3>
          <button class="btn-close" (click)="closeFormModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <form (ngSubmit)="saveDonation()">
          <div class="form-row" *ngIf="!isMember">
            <div class="form-group">
              <label>Membre *</label>
              <select [(ngModel)]="form.member" name="member" required (ngModelChange)="onMemberChange()">
                <option value="">Selectionner un membre</option>
                <option *ngFor="let m of members" [ngValue]="m.id">{{ m.full_name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row" *ngIf="!isMember && selectedMemberInfo">
            <div class="form-group">
              <label>Email du membre (pour envoi recu)</label>
              <input type="email" [(ngModel)]="form.member_email" name="member_email" placeholder="email@gmail.com">
            </div>
            <div class="form-group">
              <label>Telephone du membre (pour WhatsApp)</label>
              <input type="tel" [(ngModel)]="form.member_phone" name="member_phone" placeholder="+237 6XX XXX XXX">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type de don *</label>
              <select [(ngModel)]="form.donation_type" name="donation_type" required>
                <option value="TITHE">Dime</option>
                <option value="GENERAL_OFFERING">Offrande generale</option>
                <option value="SPECIAL_OFFERING">Offrande speciale</option>
                <option value="DESIGNATED_FUND">Fonds designe</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label>Montant (FCFA) *</label>
              <input type="number" [(ngModel)]="form.amount" name="amount" required min="1" placeholder="0">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="form.donation_date" name="donation_date" required>
            </div>
            <div class="form-group">
              <label>Mode de paiement *</label>
              <select [(ngModel)]="form.payment_method" name="payment_method" required>
                <option value="CASH">Especes</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK_TRANSFER">Virement bancaire</option>
                <option value="CHECK">Cheque</option>
                <option value="CARD">Carte</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Notes</label>
              <input type="text" [(ngModel)]="form.notes" name="notes" placeholder="Notes optionnelles">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closeFormModal()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">
              {{ saving ? 'Enregistrement...' : (isMember ? 'Envoyer le don' : 'Enregistrer') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reject Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showRejectModal" (click)="closeRejectModal()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Rejeter le don</h3>
          <button class="btn-close" (click)="closeRejectModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="form-group" style="margin-bottom:16px">
          <label>Motif du rejet *</label>
          <input [(ngModel)]="rejectReason" placeholder="Indiquez le motif du rejet">
        </div>
        <div class="form-actions">
          <button class="btn-secondary" (click)="closeRejectModal()">Retour</button>
          <button class="btn-danger" (click)="rejectDonation()" [disabled]="!rejectReason || processingId">
            Rejeter le don
          </button>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showCancelModal" (click)="closeCancelModal()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Annuler le don</h3>
          <button class="btn-close" (click)="closeCancelModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="form-group" style="margin-bottom:16px">
          <label>Motif de l'annulation *</label>
          <input [(ngModel)]="cancelReason" placeholder="Indiquez le motif de l'annulation">
        </div>
        <div class="form-actions">
          <button class="btn-secondary" (click)="closeCancelModal()">Retour</button>
          <button class="btn-danger" (click)="cancelDonation()" [disabled]="!cancelReason || processingId">
            Annuler le don
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Supprimer le don</h3>
          <button class="btn-close" (click)="closeDeleteModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <p style="margin-bottom:16px; color: var(--gray-600);">
          Etes-vous sur de vouloir supprimer le don <strong>{{ deletingDon?.donation_number }}</strong> ?
          Cette action est irreversible.
        </p>
        <div class="form-actions">
          <button class="btn-secondary" (click)="closeDeleteModal()">Annuler</button>
          <button class="btn-danger" (click)="deleteDonation()" [disabled]="processingId">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-right { display: flex; gap: 10px; align-items: center; }
    .header-left h2 { margin: 0; font-size: 22px; }

    .btn-donate {
      font-size: 16px; padding: 12px 28px; border-radius: 12px;
      background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 4px 12px rgba(22,163,74,0.3);
      &:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(22,163,74,0.4); }
    }

    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .stat-card {
      display: flex; align-items: center; gap: 16px; padding: 20px;
      background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
    }
    .stat-icon { font-size: 40px; color: var(--primary); }
    .stat-icon.stat-validated { color: #16a34a; }
    .stat-icon.stat-pending { color: #d97706; }
    .stat-icon.stat-donors { color: #7c3aed; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 700; color: var(--gray-800); }
    .stat-label { font-size: 13px; color: var(--gray-500); }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-bar {
      display: flex; align-items: center; gap: 8px; background: var(--white);
      border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 10px 16px; flex: 1; min-width: 200px;
      .material-icons { color: var(--gray-400); font-size: 20px; }
      input { border: none; outline: none; flex: 1; font-size: 14px; font-family: var(--font-family); }
    }
    .filter-select {
      padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius);
      font-size: 14px; font-family: var(--font-family); background: var(--white);
      &:focus { outline: none; border-color: var(--primary); }
    }

    .table-container { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--gray-50); padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 16px; border-top: 1px solid var(--gray-100); font-size: 14px; }
    .actions { display: flex; gap: 4px; flex-wrap: nowrap; }

    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .badge-draft { background: #e5e7eb; color: #374151; }
    .badge-pending { background: #fef9c3; color: #854d0e; }
    .badge-validated { background: #dcfce7; color: #166534; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--primary); color: #fff; border: none;
      border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font-family); transition: all 0.15s;
      &:hover { background: var(--primary-hover); } &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .btn-outline {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--white); color: var(--gray-700);
      border: 1px solid var(--gray-200); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: 600;
      font-family: var(--font-family); transition: all 0.15s;
      &:hover { background: var(--gray-50); border-color: var(--primary); color: var(--primary); }
      svg { flex-shrink: 0; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-family); }
    .btn-danger { padding: 10px 16px; background: #dc2626; color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-family); font-weight: 600; &:disabled { opacity: 0.6; cursor: not-allowed; } }

    .btn-icon {
      width: 32px; height: 32px; border: none; background: var(--gray-50); border-radius: 8px;
      cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
      .material-icons { font-size: 16px; color: var(--gray-500); }
      &:hover { background: var(--gray-100); } &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-success { background: #dcfce7; .material-icons { color: #16a34a; } &:hover { background: #bbf7d0; } }
    .btn-danger { background: #fef2f2; .material-icons { color: #dc2626; } &:hover { background: #fee2e2; } }
    .btn-info { background: #dbeafe; .material-icons { color: #2563eb; } &:hover { background: #bfdbfe; } }
    .btn-warning { background: #fef3c7; .material-icons { color: #d97706; } &:hover { background: #fde68a; } }
    .btn-close { background: none; border: none; cursor: pointer; padding: 4px; .material-icons { font-size: 20px; color: var(--gray-400); } }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 560px; box-shadow: var(--shadow-xl); }
    .modal-sm { max-width: 400px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h3 { margin: 0; font-size: 18px; } }
    .form-row { display: flex; gap: 12px; margin-bottom: 14px; }
    .form-group {
      flex: 1;
      label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select {
        width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
        font-size: 14px; font-family: var(--font-family); box-sizing: border-box;
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

    .empty-state, .loading-state {
      text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }
    .empty-icon { font-size: 48px; color: var(--gray-300); }
    .spinning { animation: spin 1s linear infinite; font-size: 32px; color: var(--primary); }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class DonationsComponent implements OnInit {
  donations: Don[] = [];
  filtered: Don[] = [];
  members: Member[] = [];
  search = '';
  filterType = '';
  filterStatus = '';
  loading = false;
  saving = false;
  processingId = 0;

  showFormModal = false;
  editingDon: Don | null = null;
  form: any = {};

  showRejectModal = false;
  rejectingDon: Don | null = null;
  rejectReason = '';

  showCancelModal = false;
  cancellingDon: Don | null = null;
  cancelReason = '';

  showDeleteModal = false;
  deletingDon: Don | null = null;

  totalDons = 0;
  totalValidated = 0;
  myTotalValidated = 0;
  pendingCount = 0;
  donorCount = 0;
  selectedMemberInfo: any = null;

  get isMember(): boolean {
    return this.auth.currentUser?.role === ROLES.MEMBER;
  }

  private typeLabels: Record<string, string> = {
    TITHE: 'Dime', GENERAL_OFFERING: 'Offrande generale', SPECIAL_OFFERING: 'Offrande speciale',
    DESIGNATED_FUND: 'Fonds designe', OTHER: 'Autre'
  };
  private statusLabels: Record<string, string> = {
    DRAFT: 'Brouillon', PENDING_VALIDATION: 'En attente', VALIDATED: 'Valide',
    REJECTED: 'Rejete', CANCELLATION_REQUESTED: 'Annulation demandee', CANCELLED: 'Annule', CORRECTED: 'Corrige'
  };
  private methodLabels: Record<string, string> = {
    CASH: 'Especes', MOBILE_MONEY: 'Mobile Money', BANK_TRANSFER: 'Virement',
    CHECK: 'Cheque', CARD: 'Carte', OTHER: 'Autre'
  };

  constructor(private api: ApiService, public auth: AuthService, private toast: ToastService) {}

  ngOnInit() {
    this.loadDonations();
    if (!this.isMember) {
      this.loadMembers();
    }
  }

  loadDonations() {
    this.loading = true;
    this.api.getDonations().subscribe({
      next: (res: any) => {
        this.donations = res.results || res || [];
        this.computeStats();
        this.filterList();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadMembers() {
    this.api.getMembers({ page_size: 1000 }).subscribe({
      next: (res: any) => { this.members = res.results || res || []; },
      error: () => {}
    });
  }

  computeStats() {
    this.totalDons = this.donations.length;
    this.totalValidated = this.donations
      .filter(d => d.status === 'VALIDATED')
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    this.myTotalValidated = this.totalValidated;
    this.pendingCount = this.donations.filter(d => d.status === 'PENDING_VALIDATION').length;
    const donorIds = new Set(this.donations.filter(d => d.member).map(d => d.member));
    this.donorCount = donorIds.size;
  }

  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.donations.filter(d => {
      const matchSearch = !q ||
        d.donation_number?.toLowerCase().includes(q) ||
        d.member_name?.toLowerCase().includes(q);
      const matchType = !this.filterType || d.donation_type === this.filterType;
      const matchStatus = !this.filterStatus || d.status === this.filterStatus;
      return matchSearch && matchType && matchStatus;
    }).sort((a, b) => new Date(a.donation_date).getTime() - new Date(b.donation_date).getTime());
  }

  typeLabel(t: string): string { return this.typeLabels[t] || t; }
  statusLabel(s: string): string { return this.statusLabels[s] || s; }
  methodLabel(m: string): string { return this.methodLabels[m] || m; }

  onMemberChange() {
    const member = this.members.find((m: any) => m.id === this.form.member);
    if (member) {
      this.selectedMemberInfo = member;
      this.form.member_email = member.email || '';
      this.form.member_phone = member.phone || '';
    } else {
      this.selectedMemberInfo = null;
      this.form.member_email = '';
      this.form.member_phone = '';
    }
  }

  openCreateModal() {
    this.editingDon = null;
    this.form = {
      member: '', donation_type: 'GENERAL_OFFERING', amount: null,
      donation_date: new Date().toISOString().split('T')[0], payment_method: 'CASH', notes: '',
      member_email: '', member_phone: ''
    };
    this.selectedMemberInfo = null;
    this.showFormModal = true;
  }

  exportDonations() {
    this.api.exportDonationsExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dons.xlsx';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
        this.toast.success('Export termine');
      },
      error: () => this.toast.error('Erreur lors de l\'export')
    });
  }

  openEditModal(d: Don) {
    this.editingDon = d;
    this.form = {
      member: d.member, donation_type: d.donation_type, amount: d.amount,
      donation_date: d.donation_date, payment_method: d.payment_method, notes: '',
      member_email: '', member_phone: ''
    };
    this.showFormModal = true;
  }

  closeFormModal() { this.showFormModal = false; this.editingDon = null; }

  saveDonation() {
    this.saving = true;
    const payload = { ...this.form };
    if (this.editingDon) {
      this.api.updateDonation(this.editingDon.id, payload).subscribe({
        next: () => { this.closeFormModal(); this.saving = false; this.loadDonations(); },
        error: (err) => { this.saving = false; alert(err.error?.detail || 'Erreur'); }
      });
    } else {
      this.api.createDonation(payload).subscribe({
        next: () => { this.closeFormModal(); this.saving = false; this.loadDonations(); },
        error: (err) => { this.saving = false; alert(err.error?.detail || 'Erreur'); }
      });
    }
  }

  validate(id: number) {
    this.processingId = id;
    this.api.validateDonation(id).subscribe({
      next: () => { this.processingId = 0; this.loadDonations(); },
      error: (err) => { this.processingId = 0; alert(err.error?.detail || 'Erreur'); }
    });
  }

  openRejectModal(d: Don) {
    this.rejectingDon = d;
    this.rejectReason = '';
    this.showRejectModal = true;
  }
  closeRejectModal() { this.showRejectModal = false; this.rejectingDon = null; }

  rejectDonation() {
    if (!this.rejectingDon || !this.rejectReason) return;
    this.processingId = this.rejectingDon.id;
    this.api.rejectDonation(this.rejectingDon.id, this.rejectReason).subscribe({
      next: () => { this.processingId = 0; this.closeRejectModal(); this.loadDonations(); },
      error: (err) => { this.processingId = 0; alert(err.error?.detail || 'Erreur'); }
    });
  }

  openCancelModal(d: Don) {
    this.cancellingDon = d;
    this.cancelReason = '';
    this.showCancelModal = true;
  }
  closeCancelModal() { this.showCancelModal = false; this.cancellingDon = null; }

  cancelDonation() {
    if (!this.cancellingDon || !this.cancelReason) return;
    this.processingId = this.cancellingDon.id;
    this.api.cancelDonation(this.cancellingDon.id, this.cancelReason).subscribe({
      next: () => { this.processingId = 0; this.closeCancelModal(); this.loadDonations(); },
      error: (err) => { this.processingId = 0; alert(err.error?.detail || 'Erreur'); }
    });
  }

  openDeleteModal(d: Don) {
    this.deletingDon = d;
    this.showDeleteModal = true;
  }
  closeDeleteModal() { this.showDeleteModal = false; this.deletingDon = null; }

  deleteDonation() {
    if (!this.deletingDon) return;
    this.processingId = this.deletingDon.id;
    this.api.deleteDonation(this.deletingDon.id).subscribe({
      next: () => { this.processingId = 0; this.closeDeleteModal(); this.loadDonations(); },
      error: (err) => { this.processingId = 0; alert(err.error?.detail || 'Erreur'); }
    });
  }

  downloadReceipt(id: number) {
    this.api.getDonationReceipt(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
      },
      error: () => alert('Impossible de telecharger le recu')
    });
  }
}
