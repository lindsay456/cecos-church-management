import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary, #1a1a2e);
      margin: 0;
    }

    .tabs {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--border-color, #e2e8f0);
      padding-bottom: 0;
    }
    .tab {
      padding: 0.75rem 1.5rem;
      border: none;
      background: none;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }
    .tab:hover {
      color: var(--primary, #4f46e5);
    }
    .tab.active {
      color: var(--primary, #4f46e5);
      border-bottom-color: var(--primary, #4f46e5);
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: var(--bg-card, #fff);
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .stat-card .stat-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .stat-card .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }
    .stat-card .stat-value.positive { color: var(--success, #10b981); }
    .stat-card .stat-value.negative { color: var(--danger, #ef4444); }
    .stat-card .stat-value.neutral { color: var(--primary, #4f46e5); }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .toolbar-left {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex: 1;
    }
    .search-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      font-size: 0.875rem;
      width: 250px;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--primary, #4f46e5);
    }
    .filter-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      background: var(--bg-card, #fff);
    }

    .card {
      background: var(--bg-card, #fff);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid var(--border-color, #e2e8f0);
      overflow: hidden;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary, #1a1a2e);
    }

    .btn-primary {
      background: var(--primary, #4f46e5);
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: var(--primary-dark, #4338ca); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-secondary {
      background: var(--bg-secondary, #f1f5f9);
      color: var(--text-primary, #1a1a2e);
      border: 1px solid var(--border-color, #e2e8f0);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: var(--border-color, #e2e8f0); }

    .btn-danger {
      background: var(--danger, #ef4444);
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .btn-danger:hover { background: #dc2626; }

    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
      background: transparent;
    }
    .btn-icon.edit {
      color: var(--primary, #4f46e5);
    }
    .btn-icon.edit:hover {
      background: rgba(79, 70, 229, 0.08);
    }
    .btn-icon.delete {
      color: var(--danger, #ef4444);
    }
    .btn-icon.delete:hover {
      background: rgba(239, 68, 68, 0.08);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--bg-secondary, #f8fafc);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .data-table td {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--text-primary, #1a1a2e);
      border-bottom: 1px solid var(--border-color, #f1f5f9);
    }
    .data-table tbody tr:hover {
      background: var(--bg-secondary, #f8fafc);
    }
    .data-table .actions {
      display: flex;
      gap: 0.25rem;
    }
    .empty-text {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary, #94a3b8);
      font-size: 0.9rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }
    .badge-pending { background: #fef3c7; color: #92400e; }

    .report-filters {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .report-filters .form-group {
      flex: 1;
      min-width: 160px;
    }
    .report-filters input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      width: 100%;
    }
    .report-filters input:focus {
      border-color: var(--primary, #4f46e5);
    }
    .report-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .cat-table {
      width: 100%;
      border-collapse: collapse;
    }
    .cat-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--bg-secondary, #f8fafc);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .cat-table td {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--text-primary, #1a1a2e);
      border-bottom: 1px solid var(--border-color, #f1f5f9);
    }
    .cat-section {
      margin-bottom: 1.5rem;
    }
    .cat-section h3 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary, #1a1a2e);
    }
    @media (max-width: 768px) {
      .report-summary { grid-template-columns: 1fr; }
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    }
    .modal {
      background: var(--bg-card, #fff);
      border-radius: 12px;
      width: 90%;
      max-width: 560px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary, #64748b);
      line-height: 1;
      padding: 0;
    }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color, #e2e8f0);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
    .form-group label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      border-color: var(--primary, #4f46e5);
    }
    .form-group textarea {
      resize: vertical;
      min-height: 60px;
    }

    .confirm-modal .modal-body {
      align-items: center;
      text-align: center;
    }
    .confirm-modal .confirm-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .confirm-modal .confirm-text {
      font-size: 0.95rem;
      color: var(--text-secondary, #64748b);
      margin: 0;
    }

    .form-error {
      background: #fef2f2;
      color: #991b1b;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: 1fr; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .toolbar-left { flex-direction: column; }
      .search-input { width: 100%; }
      .form-row { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <div class="page-header">
      <h2>Finance</h2>
    </div>

    <div class="tabs">
      <button class="tab" [class.active]="activeTab==='recettes'" (click)="setTab('recettes')">Recettes</button>
      <button class="tab" [class.active]="activeTab==='depenses'" (click)="setTab('depenses')">Depenses</button>
      <button class="tab" [class.active]="activeTab==='budget'" (click)="setTab('budget')">Budget</button>
      <button class="tab" [class.active]="activeTab==='rapports'" (click)="setTab('rapports')">Rapports</button>
    </div>

    <!-- Stats Row -->
    <div class="stats-row" *ngIf="activeTab==='recettes'">
      <div class="stat-card">
        <div class="stat-label">Total Recettes</div>
        <div class="stat-value positive">{{ totalRecettes | number:'1.0-0' }} FCFA</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Depenses</div>
        <div class="stat-value negative">{{ totalDepenses | number:'1.0-0' }} FCFA</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Solde</div>
        <div class="stat-value" [class.positive]="solde >= 0" [class.negative]="solde < 0">{{ solde | number:'1.0-0' }} FCFA</div>
      </div>
    </div>

    <!-- Recettes Tab -->
    <div class="card" *ngIf="activeTab==='recettes'">
      <div class="card-header">
        <h3>Recettes</h3>
        <button class="btn-primary" (click)="openForm()">+ Nouvelle recette</button>
      </div>
      <div style="padding: 1rem 1.25rem;">
        <div class="toolbar">
          <div class="toolbar-left">
            <input class="search-input" type="text" placeholder="Rechercher..." [(ngModel)]="searchTerm" (ngModelChange)="filterRecettes()">
            <select class="filter-select" [(ngModel)]="statusFilter" (ngModelChange)="filterRecettes()">
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuve</option>
              <option value="REJECTED">Rejete</option>
            </select>
          </div>
        </div>
      </div>
      <p class="empty-text" *ngIf="loading">Chargement des recettes...</p>
      <p class="empty-text" *ngIf="error && !loading">{{ error }}</p>
      <table class="data-table" *ngIf="!loading && !error">
        <thead>
          <tr>
            <th>Date</th>
            <th>Categorie</th>
            <th>Source</th>
            <th>Methode</th>
            <th>Montant</th>
            <th>Statut</th>
            <th style="width:100px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of filteredRecettes">
            <td>{{ r.date | date:'dd/MM/yyyy' }}</td>
            <td>{{ r.category_name }}</td>
            <td>{{ r.source }}</td>
            <td>{{ methodLabel(r.payment_method) }}</td>
            <td><strong>{{ r.amount | number }} FCFA</strong></td>
            <td><span class="badge" [ngClass]="statusClass(r.status)">{{ statusLabel(r.status) }}</span></td>
            <td>
              <div class="actions">
                <button class="btn-icon edit" title="Modifier" (click)="editRecette(r)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon delete" title="Supprimer" (click)="confirmDelete(r, 'recette')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!filteredRecettes.length && !loading && !error">
            <td colspan="7" class="empty-text">Aucune recette enregistree</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Depenses Tab -->
    <div class="card" *ngIf="activeTab==='depenses'">
      <div class="card-header">
        <h3>Depenses</h3>
        <button class="btn-primary" (click)="openForm()">+ Nouvelle depense</button>
      </div>
      <div style="padding: 1rem 1.25rem;">
        <div class="toolbar">
          <div class="toolbar-left">
            <input class="search-input" type="text" placeholder="Rechercher..." [(ngModel)]="searchTerm" (ngModelChange)="filterDepenses()">
            <select class="filter-select" [(ngModel)]="statusFilter" (ngModelChange)="filterDepenses()">
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuve</option>
              <option value="REJECTED">Rejete</option>
            </select>
          </div>
        </div>
      </div>
      <p class="empty-text" *ngIf="loading">Chargement des depenses...</p>
      <p class="empty-text" *ngIf="error && !loading">{{ error }}</p>
      <table class="data-table" *ngIf="!loading && !error">
        <thead>
          <tr>
            <th>Date</th>
            <th>Categorie</th>
            <th>Beneficiaire</th>
            <th>Methode</th>
            <th>Montant</th>
            <th>Statut</th>
            <th style="width:100px">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of filteredDepenses">
            <td>{{ d.date | date:'dd/MM/yyyy' }}</td>
            <td>{{ d.category_name }}</td>
            <td>{{ d.beneficiary }}</td>
            <td>{{ methodLabel(d.payment_method) }}</td>
            <td><strong>{{ d.amount | number }} FCFA</strong></td>
            <td><span class="badge" [ngClass]="statusClass(d.status)">{{ statusLabel(d.status) }}</span></td>
            <td>
              <div class="actions">
                <button class="btn-icon edit" title="Modifier" (click)="editDepense(d)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon delete" title="Supprimer" (click)="confirmDelete(d, 'depense')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!filteredDepenses.length && !loading && !error">
            <td colspan="7" class="empty-text">Aucune depense enregistree</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Budget Tab -->
    <div class="card" *ngIf="activeTab==='budget'">
      <div class="card-header">
        <h3>Budget</h3>
      </div>
      <p class="empty-text" *ngIf="loading">Chargement du budget...</p>
      <p class="empty-text" *ngIf="error && !loading">{{ error }}</p>
      <table class="data-table" *ngIf="!loading && !error">
        <thead>
          <tr>
            <th>Categorie</th>
            <th>Montant alloue</th>
            <th>Montant consomme</th>
            <th>Periode</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let b of budgets">
            <td>{{ b.category_name || b.name }}</td>
            <td><strong>{{ b.amount | number }} FCFA</strong></td>
            <td>{{ b.consumed_amount || 0 | number }} FCFA</td>
            <td>{{ b.period || b.year || '-' }}</td>
          </tr>
          <tr *ngIf="!budgets.length">
            <td colspan="4" class="empty-text">Aucun budget defini</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Rapports Tab -->
    <div *ngIf="activeTab==='rapports'">
      <div class="report-filters">
        <div class="form-group">
          <label>Date debut</label>
          <input type="date" [(ngModel)]="reportStartDate" placeholder="Date debut">
        </div>
        <div class="form-group">
          <label>Date fin</label>
          <input type="date" [(ngModel)]="reportEndDate" placeholder="Date fin">
        </div>
        <button class="btn-primary" (click)="loadReport()" [disabled]="reportLoading">
          {{ reportLoading ? 'Chargement...' : 'Generer' }}
        </button>
      </div>

      <p class="empty-text" *ngIf="reportLoading">Chargement du rapport...</p>
      <p class="empty-text" *ngIf="reportError && !reportLoading">{{ reportError }}</p>

      <ng-container *ngIf="!reportLoading && !reportError && reportData">
        <div class="report-summary">
          <div class="stat-card">
            <div class="stat-label">Total Recettes</div>
            <div class="stat-value positive">{{ reportData.recettes | number:'1.0-0' }} FCFA</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Depenses</div>
            <div class="stat-value negative">{{ reportData.depenses | number:'1.0-0' }} FCFA</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Solde</div>
            <div class="stat-value" [class.positive]="reportData.solde >= 0" [class.negative]="reportData.solde < 0">
              {{ reportData.solde | number:'1.0-0' }} FCFA
            </div>
          </div>
        </div>

        <div class="card cat-section">
          <div class="card-header"><h3>Recettes par categorie</h3></div>
          <table class="cat-table" *ngIf="reportData.recettes_by_category?.length; else noRecCat">
            <thead>
              <tr><th>Categorie</th><th>Nombre</th><th>Total</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of reportData.recettes_by_category">
                <td>{{ c.category__name || '-' }}</td>
                <td>{{ c.count }}</td>
                <td><strong>{{ c.total | number }} FCFA</strong></td>
              </tr>
            </tbody>
          </table>
          <ng-template #noRecCat><p class="empty-text">Aucune recette sur cette periode</p></ng-template>
        </div>

        <div class="card cat-section">
          <div class="card-header"><h3>Depenses par categorie</h3></div>
          <table class="cat-table" *ngIf="reportData.depenses_by_category?.length; else noDepCat">
            <thead>
              <tr><th>Categorie</th><th>Nombre</th><th>Total</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of reportData.depenses_by_category">
                <td>{{ c.category__name || '-' }}</td>
                <td>{{ c.count }}</td>
                <td><strong>{{ c.total | number }} FCFA</strong></td>
              </tr>
            </tbody>
          </table>
          <ng-template #noDepCat><p class="empty-text">Aucune depense sur cette periode</p></ng-template>
        </div>
      </ng-container>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ edit ? 'Modifier' : (activeTab==='depenses' ? 'Nouvelle depense' : 'Nouvelle recette') }}</h3>
          <button class="btn-close" (click)="closeForm()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-error" *ngIf="formError">{{ formError }}</div>
          <div class="form-group">
            <label>Categorie *</label>
            <select class="form-select" [(ngModel)]="formData.category" name="category">
              <option [ngValue]="null" disabled>Choisir une categorie</option>
              <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Montant *</label>
              <input type="number" [(ngModel)]="formData.amount" name="amount" placeholder="0">
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="formData.date" name="date">
            </div>
          </div>
          <div class="form-group" *ngIf="activeTab!=='depenses'">
            <label>Source</label>
            <input [(ngModel)]="formData.source" name="source" placeholder="Ex: Offrande du dimanche">
          </div>
          <div class="form-group" *ngIf="activeTab==='depenses'">
            <label>Beneficiaire</label>
            <input [(ngModel)]="formData.beneficiary" name="beneficiary" placeholder="Ex: Fournisseur electricite">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Methode de paiement</label>
              <select [(ngModel)]="formData.payment_method" name="payment_method">
                <option *ngFor="let m of paymentMethods" [value]="m">{{ methodLabel(m) }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Statut</label>
              <select [(ngModel)]="formData.status" name="status">
                <option *ngFor="let s of statuses" [value]="s">{{ statusLabel(s) }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="formData.description" name="description" placeholder="Description optionnelle"></textarea>
          </div>
          <div class="form-group">
            <label>Reference</label>
            <input [(ngModel)]="formData.reference" name="reference" placeholder="Numero de reference">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeForm()">Annuler</button>
          <button class="btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Enregistrement...' : (edit ? 'Modifier' : 'Enregistrer') }}</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteConfirm" (click)="showDeleteConfirm=false">
      <div class="modal confirm-modal" (click)="$event.stopPropagation()" style="max-width:400px">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button class="btn-close" (click)="showDeleteConfirm=false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="confirm-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <p class="confirm-text">Voulez-vous vraiment supprimer cet element ? Cette action est irreversible.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="showDeleteConfirm=false">Annuler</button>
          <button class="btn-danger" (click)="delete()" [disabled]="deleting">{{ deleting ? 'Suppression...' : 'Supprimer' }}</button>
        </div>
      </div>
    </div>
  `
})
export class FinanceComponent implements OnInit {
  activeTab = 'recettes';
  loading = false;
  error = '';
  saving = false;
  deleting = false;
  formError = '';

  recettes: any[] = [];
  depenses: any[] = [];
  budgets: any[] = [];
  categories: any[] = [];

  filteredRecettes: any[] = [];
  filteredDepenses: any[] = [];

  searchTerm = '';
  statusFilter = '';

  showForm = false;
  showDeleteConfirm = false;
  edit = false;
  editId: number | null = null;
  deleteTarget: any = null;
  deleteType = '';

  totalRecettes = 0;
  totalDepenses = 0;
  solde = 0;

  paymentMethods = ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK', 'OTHER'];
  statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  private readonly methodLabels: { [key: string]: string } = {
    CASH: 'Especes',
    MOBILE_MONEY: 'Mobile Money',
    BANK_TRANSFER: 'Virement bancaire',
    CHECK: 'Cheque',
    OTHER: 'Autre'
  };

  private readonly statusLabels: { [key: string]: string } = {
    PENDING: 'En attente',
    APPROVED: 'Approuve',
    REJECTED: 'Rejete'
  };

  formData: any = this.emptyForm();

  reportStartDate = '';
  reportEndDate = '';
  reportLoading = false;
  reportError = '';
  reportData: any = null;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadTab();
  }

  loadCategories() {
    this.api.getFinancialCategories().subscribe({
      next: (res: any) => { this.categories = res.results || res || []; },
      error: () => { this.categories = []; }
    });
  }

  setTab(tab: string) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.searchTerm = '';
    this.statusFilter = '';
    this.loadTab();
  }

  loadTab() {
    if (this.activeTab === 'recettes') this.loadRecettes();
    else if (this.activeTab === 'depenses') this.loadDepenses();
    else if (this.activeTab === 'rapports') { /* report is loaded on demand */ }
    else this.loadBudgets();
  }

  loadRecettes() {
    this.loading = true;
    this.error = '';
    this.api.getRecettes().subscribe({
      next: (res: any) => {
        this.recettes = res.results || res || [];
        this.filteredRecettes = [...this.recettes];
        this.computeStats();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Erreur lors du chargement des recettes';
        this.loading = false;
      }
    });
  }

  loadDepenses() {
    this.loading = true;
    this.error = '';
    this.api.getDepenses().subscribe({
      next: (res: any) => {
        this.depenses = res.results || res || [];
        this.filteredDepenses = [...this.depenses];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Erreur lors du chargement des depenses';
        this.loading = false;
      }
    });
  }

  loadBudgets() {
    this.loading = true;
    this.error = '';
    this.api.getBudgets().subscribe({
      next: (res: any) => {
        this.budgets = res.results || res || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Erreur lors du chargement du budget';
        this.loading = false;
      }
    });
  }

  loadReport() {
    this.reportLoading = true;
    this.reportError = '';
    this.reportData = null;
    const params: any = {};
    if (this.reportStartDate) params.start_date = this.reportStartDate;
    if (this.reportEndDate) params.end_date = this.reportEndDate;
    this.api.getFinanceSummaryReport(params).subscribe({
      next: (res: any) => {
        this.reportData = res;
        this.reportLoading = false;
      },
      error: (err) => {
        this.reportError = err.error?.detail || 'Erreur lors du chargement du rapport';
        this.reportLoading = false;
      }
    });
  }

  computeStats() {
    this.totalRecettes = this.recettes
      .filter(r => r.status === 'APPROVED')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    this.totalDepenses = this.depenses
      .filter(d => d.status === 'APPROVED')
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    this.solde = this.totalRecettes - this.totalDepenses;
  }

  filterRecettes() {
    const term = this.searchTerm.toLowerCase();
    this.filteredRecettes = this.recettes.filter(r => {
      const matchSearch = !term ||
        (r.source && r.source.toLowerCase().includes(term)) ||
        (r.category_name && r.category_name.toLowerCase().includes(term)) ||
        (r.amount && r.amount.toString().includes(term));
      const matchStatus = !this.statusFilter || r.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  filterDepenses() {
    const term = this.searchTerm.toLowerCase();
    this.filteredDepenses = this.depenses.filter(d => {
      const matchSearch = !term ||
        (d.beneficiary && d.beneficiary.toLowerCase().includes(term)) ||
        (d.category_name && d.category_name.toLowerCase().includes(term)) ||
        (d.amount && d.amount.toString().includes(term));
      const matchStatus = !this.statusFilter || d.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  openForm() {
    this.edit = false;
    this.editId = null;
    this.formData = this.emptyForm();
    this.formError = '';
    this.showForm = true;
  }

  editRecette(r: any) {
    this.edit = true;
    this.editId = r.id;
    this.formData = {
      category: r.category,
      amount: r.amount,
      date: r.date,
      source: r.source || '',
      beneficiary: '',
      payment_method: r.payment_method || 'CASH',
      status: r.status || 'PENDING',
      description: r.description || '',
      reference: r.reference || ''
    };
    this.formError = '';
    this.showForm = true;
  }

  editDepense(d: any) {
    this.edit = true;
    this.editId = d.id;
    this.formData = {
      category: d.category,
      amount: d.amount,
      date: d.date,
      source: '',
      beneficiary: d.beneficiary || '',
      payment_method: d.payment_method || 'CASH',
      status: d.status || 'PENDING',
      description: d.description || '',
      reference: d.reference || ''
    };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.edit = false;
    this.editId = null;
    this.formError = '';
  }

  save() {
    if (!this.formData.category || !this.formData.amount) {
      this.formError = 'La categorie et le montant sont obligatoires';
      return;
    }
    this.saving = true;
    this.formError = '';
    const isDepense = this.activeTab === 'depenses';

    let obs: any;
    if (this.edit && this.editId) {
      obs = isDepense
        ? this.api.updateDepense(this.editId, this.formData)
        : this.api.updateRecette(this.editId, this.formData);
    } else {
      obs = isDepense
        ? this.api.createDepense(this.formData)
        : this.api.createRecette(this.formData);
    }

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        if (isDepense) { this.loadDepenses(); } else { this.loadRecettes(); }
        this.toast.success(this.edit ? 'Enregistrement modifie' : 'Enregistrement cree');
      },
      error: (err: any) => {
        this.saving = false;
        this.formError = err.error?.detail || err.error?.message || "Erreur lors de l'enregistrement";
      }
    });
  }

  confirmDelete(item: any, type: string) {
    this.deleteTarget = item;
    this.deleteType = type;
    this.showDeleteConfirm = true;
  }

  delete() {
    if (!this.deleteTarget) return;
    this.deleting = true;
    const obs = this.deleteType === 'recette'
      ? this.api.deleteRecette(this.deleteTarget.id)
      : this.api.deleteDepense(this.deleteTarget.id);

    obs.subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.deleteTarget = null;
        if (this.deleteType === 'recette') { this.loadRecettes(); } else { this.loadDepenses(); }
        if (this.activeTab === 'recettes' && this.depenses.length) {
          this.loadDepenses();
        }
        this.toast.success('Suppression effectuee');
      },
      error: (err: any) => {
        this.deleting = false;
        this.error = err.error?.detail || 'Erreur lors de la suppression';
      }
    });
  }

  methodLabel(method: string): string {
    return this.methodLabels[method] || method;
  }

  statusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  statusClass(status: string): string {
    return status === 'APPROVED' ? 'badge-active' : status === 'REJECTED' ? 'badge-inactive' : 'badge-pending';
  }

  private emptyForm() {
    return {
      category: null,
      amount: null,
      date: new Date().toISOString().slice(0, 10),
      source: '',
      beneficiary: '',
      payment_method: 'CASH',
      status: 'PENDING',
      description: '',
      reference: ''
    };
  }
}
