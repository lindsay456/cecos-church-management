import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-redistribution',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Redistribution comptable</h2>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="material-icons stat-icon" style="color:var(--primary)">swap_horiz</span>
        <div class="stat-info">
          <span class="stat-value">{{ redistributions.length }}</span>
          <span class="stat-label">Redistribution(s)</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon" style="color:var(--green)">payments</span>
        <div class="stat-info">
          <span class="stat-value">{{ totalTransferred | number }} FCFA</span>
          <span class="stat-label">Total transfere</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="material-icons stat-icon" style="color:#ea580c">policy</span>
        <div class="stat-info">
          <span class="stat-value">{{ rules.length }}</span>
          <span class="stat-label">Regle(s)</span>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab" [class.active]="tab==='history'" (click)="tab='history'">
        <span class="material-icons">history</span>
        Historique
      </button>
      <button class="tab" [class.active]="tab==='rules'" (click)="tab='rules'">
        <span class="material-icons">policy</span>
        Regles
      </button>
      <button class="tab" [class.active]="tab==='funds'" (click)="tab='funds'">
        <span class="material-icons">account_balance_wallet</span>
        Fonds designes
      </button>
    </div>

    <!-- History Tab -->
    <div *ngIf="tab==='history'">
      <div class="table-container" *ngIf="redistributions.length">
        <table>
          <thead>
            <tr>
              <th>Don #</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Montant transfere</th>
              <th>Pourcentage</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of redistributions">
              <td><code>{{ r.donation_number }}</code></td>
              <td>{{ r.source_entity_name }}</td>
              <td>{{ r.destination_type }}</td>
              <td><strong>{{ r.transferred_amount | number }} FCFA</strong></td>
              <td>{{ r.applied_percentage }}%</td>
              <td>{{ r.calculation_date | date:'dd/MM/yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty-state" *ngIf="!loading && !redistributions.length">
        <span class="material-icons empty-icon">swap_horiz</span>
        <h3>Aucune redistribution</h3>
        <p>L'historique des redistributions apparaitra ici.</p>
      </div>
    </div>

    <!-- Rules Tab -->
    <div *ngIf="tab==='rules'">
      <div class="tab-actions">
        <button class="btn-primary" (click)="openRuleModal()">
          <span class="material-icons">add</span>
          Nouvelle regle
        </button>
      </div>
      <div class="rules-grid" *ngIf="rules.length">
        <div class="rule-card" *ngFor="let r of rules">
          <div class="rule-header">
            <span class="material-icons">policy</span>
            <h4>{{ r.name || 'Regle #' + r.id }}</h4>
            <div class="rule-actions">
              <button class="icon-btn" (click)="editRule(r)" title="Modifier">
                <span class="material-icons">edit</span>
              </button>
              <button class="icon-btn danger" (click)="confirmDeleteRule(r)" title="Supprimer">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
          <div class="rule-details">
            <div class="rule-row">
              <span class="rule-key">Type source:</span>
              <span class="rule-value">{{ r.source_entity_type || '-' }}</span>
            </div>
            <div class="rule-row">
              <span class="rule-key">Type destination:</span>
              <span class="rule-value">{{ r.destination_entity_type || '-' }}</span>
            </div>
            <div class="rule-row">
              <span class="rule-key">Pourcentage:</span>
              <span class="rule-value highlight">{{ r.percentage || r.applied_percentage || '-' }}%</span>
            </div>
            <div class="rule-row" *ngIf="r.description">
              <span class="rule-key">Description:</span>
              <span class="rule-value">{{ r.description }}</span>
            </div>
            <div class="rule-row">
              <span class="rule-key">Statut:</span>
              <span class="badge" [class.badge-active]="r.is_active !== false">
                {{ r.is_active !== false ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" *ngIf="!loading && !rules.length">
        <span class="material-icons empty-icon">policy</span>
        <h3>Aucune regle</h3>
        <p>Cliquez sur "Nouvelle regle" pour en creer une.</p>
      </div>
    </div>

    <!-- Designated Funds Tab -->
    <div *ngIf="tab==='funds'">
      <div class="table-container" *ngIf="funds.length">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Destination</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of funds">
              <td><strong>{{ f.name }}</strong></td>
              <td>{{ f.fund_type || f.type || '-' }}</td>
              <td>{{ f.destination_entity_name || f.destination || '-' }}</td>
              <td>
                <span class="badge" [class.badge-active]="f.is_active !== false">
                  {{ f.is_active !== false ? 'Actif' : 'Inactif' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty-state" *ngIf="!loading && !funds.length">
        <span class="material-icons empty-icon">account_balance_wallet</span>
        <h3>Aucun fond designe</h3>
        <p>Les fonds designes seront configures par l'administrateur.</p>
      </div>
    </div>

    <div class="loading-state" *ngIf="loading">
      <span class="material-icons spinning">refresh</span>
      <p>Chargement...</p>
    </div>

    <!-- Rule Modal -->
    <div class="modal-overlay" *ngIf="showRuleModal" (click)="closeRuleModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingRule ? 'Modifier la regle' : 'Nouvelle regle' }}</h3>
          <button class="icon-btn" (click)="closeRuleModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nom</label>
            <input type="text" [(ngModel)]="ruleForm.name" placeholder="Nom de la regle" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type source</label>
              <select [(ngModel)]="ruleForm.source_entity_type">
                <option value="">Selectionner...</option>
                <option value="LOCAL_CHURCH">Eglise locale</option>
                <option value="UNION">Union</option>
                <option value="FEDERATION">Federation</option>
                <option value="DIVISION">Division</option>
              </select>
            </div>
            <div class="form-group">
              <label>Type destination</label>
              <select [(ngModel)]="ruleForm.destination_entity_type">
                <option value="">Selectionner...</option>
                <option value="LOCAL_CHURCH">Eglise locale</option>
                <option value="UNION">Union</option>
                <option value="FEDERATION">Federation</option>
                <option value="DIVISION">Division</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Pourcentage (0-100)</label>
              <input type="number" [(ngModel)]="ruleForm.percentage" min="0" max="100" step="0.01" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="ruleForm.is_active" />
                <span>Active</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="ruleForm.description" rows="3" placeholder="Description de la regle..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeRuleModal()">Annuler</button>
          <button class="btn-primary" (click)="saveRule()" [disabled]="savingRule">
            {{ savingRule ? 'Enregistrement...' : (editingRule ? 'Modifier' : 'Creer') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button class="icon-btn" (click)="closeDeleteModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="delete-msg">Voulez-vous vraiment supprimer la regle <strong>{{ deletingRule?.name || 'Regle #' + deletingRule?.id }}</strong> ?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeDeleteModal()">Annuler</button>
          <button class="btn-danger" (click)="deleteRule()" [disabled]="deleting">
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 20px; h2 { margin: 0; font-size: 22px; } }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
    .stat-card {
      background: var(--white); border-radius: var(--radius); padding: 20px;
      box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 16px;
      border: 1px solid var(--gray-100);
    }
    .stat-icon { font-size: 32px !important; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 20px; font-weight: 700; color: var(--gray-900); }
    .stat-label { font-size: 12px; color: var(--gray-500); }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--white); border-radius: var(--radius); padding: 4px; box-shadow: var(--shadow-sm); }
    .tab {
      display: flex; align-items: center; gap: 6px; padding: 10px 20px; border: none; background: transparent;
      border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; color: var(--gray-500);
      cursor: pointer; font-family: var(--font-family); transition: all 0.15s;
      .material-icons { font-size: 18px; }
      &:hover { color: var(--gray-700); background: var(--gray-50); }
      &.active { background: var(--primary); color: #fff; box-shadow: var(--shadow-sm); }
    }
    .tab-actions { display: flex; justify-content: flex-end; margin-bottom: 16px; }
    .btn-primary {
      display: flex; align-items: center; gap: 6px; padding: 10px 18px; border: none; background: var(--primary);
      color: #fff; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
      cursor: pointer; font-family: var(--font-family); transition: all 0.15s;
      .material-icons { font-size: 18px; }
      &:hover { opacity: 0.9; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .btn-secondary {
      padding: 10px 18px; border: 1px solid var(--gray-200); background: var(--white);
      color: var(--gray-700); border-radius: var(--radius-sm); font-size: 14px; font-weight: 500;
      cursor: pointer; font-family: var(--font-family);
      &:hover { background: var(--gray-50); }
    }
    .btn-danger {
      display: flex; align-items: center; gap: 6px; padding: 10px 18px; border: none; background: #dc2626;
      color: #fff; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
      cursor: pointer; font-family: var(--font-family); transition: all 0.15s;
      &:hover { opacity: 0.9; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .icon-btn {
      display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      border: none; background: transparent; border-radius: 6px; cursor: pointer; color: var(--gray-400);
      transition: all 0.15s;
      &:hover { background: var(--gray-100); color: var(--gray-700); }
      &.danger:hover { background: #fee2e2; color: #dc2626; }
      .material-icons { font-size: 18px; }
    }
    .table-container { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--gray-50); padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 16px; border-top: 1px solid var(--gray-100); font-size: 14px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-active { background: #dcfce7; color: #166534; }
    .rules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .rule-card {
      background: var(--white); border-radius: var(--radius); padding: 20px;
      box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100);
    }
    .rule-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
      .material-icons { color: var(--primary); font-size: 22px; }
      h4 { margin: 0; font-size: 15px; flex: 1; }
    }
    .rule-actions { display: flex; gap: 4px; }
    .rule-details { display: flex; flex-direction: column; gap: 8px; }
    .rule-row { display: flex; justify-content: space-between; font-size: 13px; }
    .rule-key { color: var(--gray-500); }
    .rule-value { color: var(--gray-800); font-weight: 500; }
    .rule-value.highlight { color: var(--primary); font-weight: 700; }
    .empty-state, .loading-state {
      text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }
    .empty-icon { font-size: 48px; color: var(--gray-300); }
    .spinning { animation: spin 1s linear infinite; font-size: 32px; color: var(--primary); }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .stats-row { grid-template-columns: 1fr; } }

    /* Modal */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 20px;
    }
    .modal {
      background: var(--white); border-radius: var(--radius); width: 100%; max-width: 520px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }
    .modal-sm { max-width: 420px; }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--gray-100);
      h3 { margin: 0; font-size: 18px; font-weight: 700; }
    }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--gray-100); }
    .form-group { margin-bottom: 16px;
      label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
      input, select, textarea {
        width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
        font-size: 14px; font-family: var(--font-family); color: var(--gray-800); box-sizing: border-box;
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
      }
      textarea { resize: vertical; }
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .checkbox-label {
      display: flex !important; align-items: center; gap: 8px; padding-top: 28px; cursor: pointer;
      input[type="checkbox"] { width: 16px !important; height: 16px; accent-color: var(--primary); }
    }
    .delete-msg { font-size: 14px; color: var(--gray-600); margin: 0; line-height: 1.5; }
  `]
})
export class RedistributionComponent implements OnInit {
  redistributions: any[] = [];
  rules: any[] = [];
  funds: any[] = [];
  tab = 'history';
  loading = false;

  showRuleModal = false;
  editingRule: any = null;
  savingRule = false;
  ruleForm: any = this.getEmptyForm();

  showDeleteModal = false;
  deletingRule: any = null;
  deleting = false;

  get totalTransferred(): number {
    return this.redistributions.reduce((sum, r) => sum + (r.transferred_amount || 0), 0);
  }

  constructor(private api: ApiService, public auth: AuthService) {}
  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading = true;
    this.api.getRedistributions().subscribe({
      next: (res: any) => { this.redistributions = res.results || res || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.api.getRedistributionRules().subscribe({
      next: (res: any) => { this.rules = res.results || res || []; },
      error: () => {}
    });
    this.api.getDesignatedFunds().subscribe({
      next: (res: any) => { this.funds = res.results || res || []; },
      error: () => {}
    });
  }

  getEmptyForm(): any {
    return { name: '', source_entity_type: '', destination_entity_type: '', percentage: null, description: '', is_active: true };
  }

  openRuleModal() {
    this.editingRule = null;
    this.ruleForm = this.getEmptyForm();
    this.showRuleModal = true;
  }

  editRule(rule: any) {
    this.editingRule = rule;
    this.ruleForm = {
      name: rule.name || '',
      source_entity_type: rule.source_entity_type || '',
      destination_entity_type: rule.destination_entity_type || '',
      percentage: rule.percentage || rule.applied_percentage || null,
      description: rule.description || '',
      is_active: rule.is_active !== false
    };
    this.showRuleModal = true;
  }

  closeRuleModal() {
    this.showRuleModal = false;
    this.editingRule = null;
    this.ruleForm = this.getEmptyForm();
  }

  saveRule() {
    this.savingRule = true;
    const payload = { ...this.ruleForm };

    const req = this.editingRule
      ? this.api.updateRedistributionRule(this.editingRule.id, payload)
      : this.api.createRedistributionRule(payload);

    req.subscribe({
      next: () => {
        this.savingRule = false;
        this.closeRuleModal();
        this.loadAll();
      },
      error: () => { this.savingRule = false; }
    });
  }

  confirmDeleteRule(rule: any) {
    this.deletingRule = rule;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingRule = null;
  }

  deleteRule() {
    if (!this.deletingRule) return;
    this.deleting = true;
    this.api.deleteRedistributionRule(this.deletingRule.id).subscribe({
      next: () => {
        this.deleting = false;
        this.closeDeleteModal();
        this.loadAll();
      },
      error: () => { this.deleting = false; }
    });
  }
}
