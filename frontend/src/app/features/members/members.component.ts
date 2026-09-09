import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Membres</h2>
        <p class="page-subtitle">{{ totalCount }} membre(s) au total</p>
      </div>
      <div class="header-actions">
        <button class="btn-outline" (click)="exportMembers()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Exporter
        </button>
        <button class="btn-outline" (click)="showImport = true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
          Importer
        </button>
        <button class="btn-primary" (click)="openCreate()">+ Nouveau membre</button>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input [(ngModel)]="search" (keyup.enter)="load()" placeholder="Rechercher par nom, numero, email..." class="search-input">
      </div>
      <select [(ngModel)]="filterStatus" (change)="load()">
        <option value="">Tous les statuts</option>
        <option value="ACTIVE">Actif</option>
        <option value="INACTIVE">Inactif</option>
        <option value="TRANSFERRED">Transfere</option>
        <option value="SUSPENDED">Suspendu</option>
        <option value="DECEASED">Decede</option>
        <option value="ARCHIVED">Archive</option>
      </select>
      <select [(ngModel)]="filterGender" (change)="load()">
        <option value="">Tous les genres</option>
        <option value="MALE">Homme</option>
        <option value="FEMALE">Femme</option>
      </select>
      <select [(ngModel)]="filterChapel" (change)="load()">
        <option value="">Toutes les chapelles</option>
        <option *ngFor="let c of chapels" [value]="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Numero</th>
            <th>Nom complet</th>
            <th>Genre</th>
            <th>Telephone</th>
            <th>Etat civil</th>
            <th>Chapelle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of members">
            <td><span class="member-num">{{ m.member_number }}</span></td>
            <td>
              <div class="member-name">
                <strong>{{ m.full_name }}</strong>
                <span class="member-email" *ngIf="m.email">{{ m.email }}</span>
              </div>
            </td>
            <td>{{ m.gender === 'MALE' ? 'Homme' : m.gender === 'FEMALE' ? 'Femme' : m.gender }}</td>
            <td>{{ m.phone || '-' }}</td>
            <td>{{ getMaritalLabel(m.marital_status) }}</td>
            <td>{{ m.church_name || '-' }}</td>
            <td><span class="badge" [ngClass]="'badge-' + m.status.toLowerCase()">{{ getStatusLabel(m.status) }}</span></td>
            <td>
              <div class="actions-cell">
                <button class="btn-icon" (click)="viewMember(m)" title="Consulter">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                </button>
                <button class="btn-icon" (click)="editMember(m)" title="Modifier">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
                </button>
                <button class="btn-icon btn-transfer" (click)="openTransferModal(m)" title="Transferer" *ngIf="m.status !== 'ARCHIVED'">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
                </button>
                <button class="btn-icon btn-archive" (click)="archiveMember(m)" title="Archiver" *ngIf="m.status !== 'ARCHIVED'">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!members.length">
            <td colspan="8" class="empty">Aucun membre trouve</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="btn-secondary" [disabled]="!prev" (click)="goTo(prev!)">Precedent</button>
      <span class="page-info">Page {{ currentPage }}</span>
      <button class="btn-secondary" [disabled]="!next" (click)="goTo(next!)">Suivant</button>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="showForm = false">
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editData ? 'Modifier le membre' : 'Nouveau membre' }}</h3>
          <button class="btn-close" (click)="showForm = false">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-section">
            <h4>Identite</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Prenom *</label>
                <input [(ngModel)]="form.first_name" name="first_name" required placeholder="Prenom">
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input [(ngModel)]="form.last_name" name="last_name" required placeholder="Nom de famille">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Genre *</label>
                <select [(ngModel)]="form.gender" name="gender" required>
                  <option value="MALE">Homme</option>
                  <option value="FEMALE">Femme</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date de naissance</label>
                <input type="date" [(ngModel)]="form.birth_date" name="birth_date">
              </div>
              <div class="form-group">
                <label>Etat civil</label>
                <select [(ngModel)]="form.marital_status" name="marital_status">
                  <option value="SINGLE">Celibataire</option>
                  <option value="MARRIED">Marie(e)</option>
                  <option value="DIVORCED">Divorce(e)</option>
                  <option value="WIDOWED">Veuf/Veuve</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Telephone</label>
                <input [(ngModel)]="form.phone" name="phone" placeholder="+237 6XX XXX XXX">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="form.email" name="email" placeholder="prenom.nom@gmail.com">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Quartier</label>
                <input [(ngModel)]="form.neighborhood" name="neighborhood" placeholder="Quartier">
              </div>
              <div class="form-group">
                <label>Adresse</label>
                <input [(ngModel)]="form.address" name="address" placeholder="Adresse complete">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Profession</label>
                <input [(ngModel)]="form.occupation" name="occupation" placeholder="Profession">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Bapteme</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Lieu de bapteme</label>
                <input [(ngModel)]="form.baptism_place" name="baptism_place" placeholder="Eglise ou lieu du bapteme">
              </div>
              <div class="form-group">
                <label>Date de bapteme</label>
                <input type="date" [(ngModel)]="form.baptism_date" name="baptism_date">
              </div>
              <div class="form-group">
                <label>Baptise par</label>
                <input [(ngModel)]="form.baptized_by" name="baptized_by" placeholder="Nom du baptiseur">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Rattachement</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Statut *</label>
                <select [(ngModel)]="form.status" name="status" required>
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="TRANSFERRED">Transfere</option>
                  <option value="SUSPENDED">Suspendu</option>
                  <option value="DECEASED">Decede</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date d'adhesion</label>
                <input type="date" [(ngModel)]="form.membership_date" name="membership_date">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Chapelle</label>
                <select [(ngModel)]="form.chapel" name="chapel">
                  <option [ngValue]="null">Sans chapelle</option>
                  <option *ngFor="let c of chapels" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Famille</label>
                <select [(ngModel)]="form.family" name="family">
                  <option [ngValue]="null">Sans famille</option>
                  <option *ngFor="let f of families" [ngValue]="f.id">{{ f.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4>Contact d'urgence</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Nom du contact</label>
                <input [(ngModel)]="form.emergency_contact_name" name="emergency_contact_name" placeholder="Nom">
              </div>
              <div class="form-group">
                <label>Telephone du contact</label>
                <input [(ngModel)]="form.emergency_contact_phone" name="emergency_contact_phone" placeholder="Telephone">
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showForm = false">Annuler</button>
            <button type="submit" class="btn-primary">{{ editData ? 'Enregistrer' : 'Creer le membre' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div class="modal-overlay" *ngIf="selectedMember" (click)="selectedMember = null">
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ selectedMember.full_name }}</h3>
          <button class="btn-close" (click)="selectedMember = null">&times;</button>
        </div>

        <div class="tabs">
          <button [class.active]="viewTab === 'info'" (click)="switchTab('info')">Informations</button>
          <button [class.active]="viewTab === 'donations'" (click)="switchTab('donations')">Dons</button>
          <button [class.active]="viewTab === 'receipts'" (click)="switchTab('receipts')">Recus</button>
          <button [class.active]="viewTab === 'departments'" (click)="switchTab('departments')">Departements</button>
          <button [class.active]="viewTab === 'transfers'" (click)="switchTab('transfers')">Transferts</button>
        </div>

        <div *ngIf="viewTab === 'info'" class="detail-grid">
          <div class="detail-item"><span class="detail-label">Numero</span><span>{{ selectedMember.member_number }}</span></div>
          <div class="detail-item"><span class="detail-label">Genre</span><span>{{ selectedMember.gender === 'MALE' ? 'Homme' : 'Femme' }}</span></div>
          <div class="detail-item"><span class="detail-label">Date de naissance</span><span>{{ (selectedMember.birth_date | date:'dd/MM/yyyy') || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Etat civil</span><span>{{ getMaritalLabel(selectedMember.marital_status) }}</span></div>
          <div class="detail-item"><span class="detail-label">Telephone</span><span>{{ selectedMember.phone || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Email</span><span>{{ selectedMember.email || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Quartier</span><span>{{ selectedMember.neighborhood || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Adresse</span><span>{{ selectedMember.address || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Profession</span><span>{{ selectedMember.occupation || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Statut</span><span class="badge" [ngClass]="'badge-' + selectedMember.status.toLowerCase()">{{ getStatusLabel(selectedMember.status) }}</span></div>
          <div class="detail-item"><span class="detail-label">Date d'adhesion</span><span>{{ (selectedMember.membership_date | date:'dd/MM/yyyy') || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Chapelle</span><span>{{ selectedMember.church_name || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Famille</span><span>{{ selectedMember.family_name || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Lieu de bapteme</span><span>{{ selectedMember.baptism_place || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Date de bapteme</span><span>{{ (selectedMember.baptism_date | date:'dd/MM/yyyy') || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">Baptise par</span><span>{{ selectedMember.baptized_by || '-' }}</span></div>
          <div class="detail-item full-width"><span class="detail-label">Contact d'urgence</span><span>{{ selectedMember.emergency_contact_name || '-' }} {{ selectedMember.emergency_contact_phone ? '(' + selectedMember.emergency_contact_phone + ')' : '' }}</span></div>
        </div>

        <div *ngIf="viewTab === 'donations'" class="detail-section">
          <div *ngIf="loadingDonations" class="loading-state">
            <span>Chargement des dons...</span>
          </div>
          <div *ngIf="!loadingDonations && memberDonations.length; else noDonations">
            <div class="mini-table-container">
              <table class="mini-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Categorie</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Recu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of memberDonations">
                    <td>{{ (d.donation_date | date:'dd/MM/yyyy') || '-' }}</td>
                    <td>{{ d.donation_type_display || d.donation_type || d.category_name || d.category || '-' }}</td>
                    <td class="amount">{{ formatAmount(d.amount) }}</td>
                    <td><span class="badge badge-sm" [ngClass]="'badge-' + (d.status || 'PENDING').toLowerCase()">{{ getDonationStatusLabel(d.status) }}</span></td>
                    <td>
                      <button class="btn-icon btn-info" *ngIf="d.status === 'VALIDATED'" (click)="downloadMemberReceipt(d.id)" title="Telecharger recu">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="donation-summary" *ngIf="memberDonations.length">
              <span class="summary-label">Total:</span>
              <span class="summary-value">{{ formatAmount(getDonationTotal()) }}</span>
            </div>
          </div>
          <ng-template #noDonations>
            <div *ngIf="!loadingDonations" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--gray-300)"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
              <p>Aucun don enregistre pour ce membre</p>
            </div>
          </ng-template>
        </div>

        <div *ngIf="viewTab === 'receipts'" class="detail-section">
          <div *ngIf="loadingReceipts" class="loading-state">
            <span>Chargement des recus...</span>
          </div>
          <div *ngIf="!loadingReceipts && memberReceipts.length; else noReceipts">
            <div class="receipt-list">
              <div class="receipt-item" *ngFor="let r of memberReceipts">
                <div class="receipt-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#16A34A"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
                </div>
                <div class="receipt-info">
                  <strong>{{ r.receipt_number }}</strong>
                  <span class="receipt-meta">{{ (r.issued_at | date:'dd/MM/yyyy HH:mm') || '-' }}</span>
                </div>
                <div class="receipt-status">
                  <span class="badge badge-sm" [ngClass]="r.sent_by_email ? 'badge-success' : 'badge-pending'">
                    {{ r.sent_by_email ? 'Envoye par email' : 'Non envoye' }}
                  </span>
                  <span class="badge badge-sm" [ngClass]="r.sent_by_whatsapp ? 'badge-success' : 'badge-pending'" *ngIf="r.sent_by_whatsapp">
                    Envoye WhatsApp
                  </span>
                </div>
                <button class="btn-icon" title="Telecharger" (click)="downloadReceipt(r); $event.stopPropagation()">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </button>
              </div>
            </div>
          </div>
          <ng-template #noReceipts>
            <div *ngIf="!loadingReceipts" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--gray-300)"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
              <p>Aucun recu genere pour ce membre</p>
            </div>
          </ng-template>
        </div>

        <div *ngIf="viewTab === 'departments'" class="detail-section">
          <div *ngIf="loadingDepartments" class="loading-state">
            <span>Chargement des departements...</span>
          </div>
          <div *ngIf="!loadingDepartments && memberDepartments.length; else noDepts" class="dept-list">
            <div class="dept-item" *ngFor="let d of memberDepartments">
              <div class="dept-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--primary)"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
              </div>
              <div class="dept-info">
                <strong>{{ d.department_name || d.name }}</strong>
                <span class="dept-role">{{ d.role_in_department || d.role || 'Membre' }}</span>
              </div>
              <span class="detail-label" *ngIf="d.start_date">Depuis {{ d.start_date | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
          <ng-template #noDepts>
            <div *ngIf="!loadingDepartments" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--gray-300)"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
              <p>Aucun departement assigne a ce membre</p>
            </div>
          </ng-template>
        </div>

        <div *ngIf="viewTab === 'transfers'" class="detail-section">
          <div *ngIf="loadingTransfers" class="loading-state">
            <span>Chargement de l'historique...</span>
          </div>
          <div *ngIf="!loadingTransfers && memberTransfers.length; else noTransfers" class="transfer-list">
            <div class="transfer-item" *ngFor="let t of memberTransfers">
              <div class="transfer-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--primary)"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
              </div>
              <div class="transfer-details">
                <div class="transfer-route">
                  <strong>{{ t.previous_church_name || 'N/A' }}</strong>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--gray-400)"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                  <strong>{{ t.new_church_name || 'N/A' }}</strong>
                </div>
                <div class="transfer-meta">
                  <span class="detail-label">{{ (t.transfer_date | date:'dd/MM/yyyy') || '-' }}</span>
                  <span *ngIf="t.transfer_reason" class="transfer-reason">{{ t.transfer_reason }}</span>
                </div>
                <div class="transfer-actors" *ngIf="t.requested_by_name || t.approved_by_name">
                  <span *ngIf="t.requested_by_name" class="actor">Demande par: {{ t.requested_by_name }}</span>
                  <span *ngIf="t.approved_by_name" class="actor">Approuve par: {{ t.approved_by_name }}</span>
                </div>
              </div>
              <span class="badge badge-sm" [ngClass]="'badge-' + (t.status || 'PENDING').toLowerCase()">{{ t.status || 'PENDING' }}</span>
            </div>
          </div>
          <ng-template #noTransfers>
            <div *ngIf="!loadingTransfers" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--gray-300)"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
              <p>Aucun historique de transfert</p>
            </div>
          </ng-template>
        </div>

        <div class="form-actions">
          <button class="btn-outline" (click)="openTransferModal(selectedMember)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
            Transferer
          </button>
          <button class="btn-secondary" (click)="selectedMember = null">Fermer</button>
          <button class="btn-primary" (click)="editFromView()">Modifier</button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div class="modal-overlay" *ngIf="showTransfer" (click)="showTransfer = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Transferer un membre</h3>
          <button class="btn-close" (click)="showTransfer = false">&times;</button>
        </div>
        <div class="transfer-member-info">
          <span class="detail-label">Membre</span>
          <strong>{{ transferMemberData?.full_name }}</strong>
          <span class="transfer-current-church" *ngIf="transferMemberData?.church_name">Chapelle actuelle: {{ transferMemberData.church_name }}</span>
        </div>
        <form (ngSubmit)="submitTransfer()">
          <div class="form-section">
            <div class="form-group">
              <label>Nouvelle chapelle / eglise *</label>
              <select [(ngModel)]="transferForm.new_church_id" name="new_church_id" required>
                <option [ngValue]="null" disabled>Selectionner une destination</option>
                <option *ngFor="let c of chapels" [ngValue]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Motif du transfert</label>
              <input [(ngModel)]="transferForm.reason" name="reason" placeholder="Raison du transfert" maxlength="500">
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="transferForm.notes" name="notes" placeholder="Informations complementaires..." rows="3"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showTransfer = false">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="!transferForm.new_church_id || transferring">
              {{ transferring ? 'Transfert en cours...' : 'Confirmer le transfert' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Import Modal -->
    <div class="modal-overlay" *ngIf="showImport" (click)="showImport = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Importer des membres</h3>
          <button class="btn-close" (click)="showImport = false">&times;</button>
        </div>
        <p class="import-desc">Chargez un fichier CSV ou Excel avec les informations des membres.</p>
        <div class="upload-zone">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="var(--gray-300)"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
          <p>Selectionnez un fichier Excel</p>
          <input type="file" accept=".xlsx,.csv" (change)="importMembers($event)" style="margin-top:10px;">
          <span class="import-formats">Format: .xlsx, .csv (max 5 Mo)</span>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="showImport = false">Annuler</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 22px; color: var(--gray-900); }
      .page-subtitle { font-size: 13px; color: var(--gray-400); margin: 2px 0 0; }
    }
    .header-actions { display: flex; gap: 10px; }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 250px; position: relative; display: flex; align-items: center;
      svg { position: absolute; left: 12px; }
      .search-input { padding-left: 38px; }
    }
    .search-input { width: 100%; padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-family); background: var(--white);
      &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    }
    select { padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; background: var(--white); font-family: var(--font-family);
      &:focus { outline: none; border-color: var(--primary); }
    }

    .table-container { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; border: 1px solid var(--gray-100); }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--gray-50); padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--gray-100); }
    td { padding: 12px 16px; border-bottom: 1px solid var(--gray-50); font-size: 14px; color: var(--gray-700); }
    tr:hover { background: var(--gray-50); }
    .empty { text-align: center; color: var(--gray-400); padding: 40px !important; }
    .member-num { font-family: monospace; font-size: 13px; color: var(--primary); font-weight: 600; }
    .member-name { display: flex; flex-direction: column; gap: 2px;
      .member-email { font-size: 12px; color: var(--gray-400); }
    }
    .actions-cell { display: flex; gap: 4px; }

    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
    .badge-sm { padding: 2px 8px; font-size: 11px; }
    .badge-active, .badge-ACTIVE { background: #DCFCE7; color: #166534; }
    .badge-inactive, .badge-INACTIVE { background: #FEF3C7; color: #92400E; }
    .badge-transferred, .badge-TRANSFERRED { background: #DBEAFE; color: #1E40AF; }
    .badge-suspended, .badge-SUSPENDED { background: #FEE2E2; color: #991B1B; }
    .badge-deceased, .badge-DECEASED { background: #F3F4F6; color: #374151; }
    .badge-archived, .badge-ARCHIVED { background: #E5E7EB; color: #6B7280; }
    .badge-pending, .badge-PENDING { background: #FEF3C7; color: #92400E; }
    .badge-APPROVED { background: #DCFCE7; color: #166534; }
    .badge-REJECTED { background: #FEE2E2; color: #991B1B; }
    .badge-validated, .badge-VALIDATED { background: #DCFCE7; color: #166534; }
    .badge-cancelled, .badge-CANCELLED { background: #F3F4F6; color: #374151; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; font-size: 14px; }
    .page-info { color: var(--gray-500); }

    .btn-primary { padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family); display: inline-flex; align-items: center; gap: 6px;
      &:hover { background: var(--primary-hover); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &:hover:not(:disabled) { background: var(--gray-200); }
    }
    .btn-outline { padding: 10px 16px; background: var(--white); color: var(--gray-700); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s;
      &:hover { background: var(--gray-50); border-color: var(--primary); color: var(--primary); }
    }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: var(--gray-500); display: inline-flex; align-items: center;
      &:hover { background: var(--gray-100); color: var(--gray-700); }
      &.btn-archive:hover { background: #FEE2E2; color: #991B1B; }
      &.btn-transfer:hover { background: #DBEAFE; color: #1E40AF; }
    }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius); padding: 28px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-lg { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h3 { margin: 0; font-size: 20px; color: var(--gray-900); }
    }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-400); padding: 4px; line-height: 1;
      &:hover { color: var(--gray-700); }
    }

    .form-section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--gray-100);
      &:last-of-type { border-bottom: none; margin-bottom: 0; }
      h4 { font-size: 14px; font-weight: 700; color: var(--primary); margin: 0 0 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    }
    .form-row { display: flex; gap: 12px; margin-bottom: 14px; }
    .form-group { flex: 1; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
      textarea { resize: vertical; min-height: 80px; }
    }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-100); }

    .tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 2px solid var(--gray-100);
      button { padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; font-size: 14px; font-weight: 600; color: var(--gray-400); cursor: pointer; font-family: var(--font-family);
        &.active { color: var(--primary); border-bottom-color: var(--primary); }
        &:hover:not(.active) { color: var(--gray-600); }
      }
    }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; padding: 10px 0; border-bottom: 1px solid var(--gray-50); }
    .detail-item.full-width { grid-column: 1 / -1; }
    .detail-label { font-size: 12px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-section { min-height: 200px; }

    .loading-state { display: flex; justify-content: center; align-items: center; padding: 40px 0; color: var(--gray-400); font-size: 14px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0; gap: 12px;
      p { font-size: 14px; color: var(--gray-400); margin: 0; }
    }

    .mini-table-container { overflow-x: auto; border: 1px solid var(--gray-100); border-radius: var(--radius-sm); }
    .mini-table { width: 100%; border-collapse: collapse;
      th { background: var(--gray-50); padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--gray-100); }
      td { padding: 10px 14px; border-bottom: 1px solid var(--gray-50); font-size: 13px; color: var(--gray-700); }
      .amount { font-weight: 600; color: var(--gray-900); }
    }
    .donation-summary { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 14px; background: var(--gray-50); border-radius: var(--radius-sm); margin-top: 10px; font-size: 14px;
      .summary-label { color: var(--gray-500); font-weight: 600; }
      .summary-value { color: var(--gray-900); font-weight: 700; }
    }

    .dept-list, .transfer-list { display: flex; flex-direction: column; gap: 10px; }
    .dept-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--gray-50); border-radius: var(--radius-sm); }
    .dept-icon { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(37,99,235,0.1); border-radius: 8px; }
    .dept-info { flex: 1; display: flex; flex-direction: column; gap: 2px;
      strong { font-size: 14px; color: var(--gray-900); }
      .dept-role { font-size: 12px; color: var(--gray-500); }
    }

    .transfer-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: var(--gray-50); border-radius: var(--radius-sm); }
    .transfer-icon { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(37,99,235,0.1); border-radius: 8px; }
    .transfer-details { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .transfer-route { display: flex; align-items: center; gap: 8px; font-size: 14px;
      strong { color: var(--gray-900); }
    }
    .transfer-meta { display: flex; align-items: center; gap: 10px; font-size: 12px; }
    .transfer-reason { color: var(--gray-600); font-style: italic; }
    .transfer-actors { display: flex; gap: 16px; font-size: 12px; }
    .actor { color: var(--gray-500); }

    .receipt-list { display: flex; flex-direction: column; gap: 10px; }
    .receipt-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--gray-50); border-radius: var(--radius-sm); }
    .receipt-icon { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(22,163,74,0.1); border-radius: 8px; }
    .receipt-info { flex: 1; display: flex; flex-direction: column; gap: 2px;
      strong { font-size: 14px; color: var(--gray-900); }
      .receipt-meta { font-size: 12px; color: var(--gray-500); }
    }
    .receipt-status { display: flex; gap: 6px; }
    .badge-success { background: #ECFDF5; color: #065F46; }
    .badge-pending { background: #FEF9C3; color: #92400E; }

    .transfer-member-info { display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; background: var(--gray-50); border-radius: var(--radius-sm); margin-bottom: 20px;
      strong { font-size: 16px; color: var(--gray-900); }
      .transfer-current-church { font-size: 13px; color: var(--gray-500); }
    }

    .empty-text { font-size: 14px; color: var(--gray-400); text-align: center; padding: 30px 0; }

    .import-desc { font-size: 14px; color: var(--gray-600); margin-bottom: 20px; }
    .upload-zone { border: 2px dashed var(--gray-200); border-radius: var(--radius); padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: var(--primary); background: var(--primary-light); }
      p { margin: 12px 0 4px; font-size: 14px; color: var(--gray-600); a { color: var(--primary); font-weight: 600; } }
      .import-formats { font-size: 12px; color: var(--gray-400); }
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .header-actions { width: 100%; flex-wrap: wrap; }
      .filters-bar { flex-direction: column; }
      .search-box { min-width: 100%; }
      .form-row { flex-direction: column; }
      .detail-grid { grid-template-columns: 1fr; }
      .tabs { overflow-x: auto; }
    }
  `]
})
export class MembersComponent implements OnInit {
  members: any[] = [];
  chapels: any[] = [];
  families: any[] = [];
  totalCount = 0;
  search = '';
  filterStatus = '';
  filterGender = '';
  filterChapel = '';
  currentPage = 1;
  next: string | null = null;
  prev: string | null = null;
  showForm = false;
  showImport = false;
  importing = false;
  editData: any = null;
  selectedMember: any = null;
  viewTab = 'info';
  memberDepartments: any[] = [];
  memberTransfers: any[] = [];
  memberDonations: any[] = [];
  memberReceipts: any[] = [];
  loadingDonations = false;
  loadingDepartments = false;
  loadingTransfers = false;
  loadingReceipts = false;
  defaultChurchId: number | null = null;

  showTransfer = false;
  transferMemberData: any = null;
  transferForm: any = { new_church_id: null, reason: '', notes: '' };
  transferring = false;

  form: any = this.getEmptyForm();

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
    this.loadChapels();
    this.loadFamilies();
    this.loadChurches();
  }

  getEmptyForm() {
    return {
      first_name: '', last_name: '', gender: 'MALE', birth_date: '', phone: '', email: '',
      marital_status: 'SINGLE', neighborhood: '', address: '', occupation: '',
      baptism_place: '', baptism_date: '', baptized_by: '',
      status: 'ACTIVE', membership_date: '', chapel: null, family: null, church: null,
      emergency_contact_name: '', emergency_contact_phone: '',
    };
  }

  load() {
    const params: any = { page: this.currentPage };
    if (this.search) params.search = this.search;
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterGender) params.gender = this.filterGender;
    if (this.filterChapel) params.church = this.filterChapel;
    this.api.getMembers(params).subscribe({
      next: (res: any) => {
        this.members = res.results || [];
        this.totalCount = res.count || this.members.length;
        this.next = res.next;
        this.prev = res.previous;
      }
    });
  }

  loadChapels() {
    this.api.getChapels().subscribe({
      next: (res: any) => { this.chapels = res.results || res || []; },
      error: () => {}
    });
  }

  loadFamilies() {
    this.api.getFamilies().subscribe({
      next: (res: any) => { this.families = res.results || res || []; },
      error: () => {}
    });
  }

  loadChurches() {
    this.api.getChurches().subscribe({
      next: (res: any) => {
        const churches = res.results || res || [];
        if (churches.length > 0) {
          this.defaultChurchId = churches[0].id;
        }
      },
      error: () => {}
    });
  }

  goTo(url: string) {
    const match = url.match(/page=(\d+)/);
    if (match) { this.currentPage = parseInt(match[1]); this.load(); }
  }

  openCreate() {
    this.editData = null;
    this.form = this.getEmptyForm();
    if (this.defaultChurchId) {
      this.form.church = this.defaultChurchId;
    }
    this.showForm = true;
  }

  editMember(m: any) {
    this.editData = m;
    this.form = { ...m };
    this.showForm = true;
  }

  editFromView() {
    this.editData = this.selectedMember;
    this.form = { ...this.selectedMember };
    this.showForm = true;
    this.selectedMember = null;
  }

  viewMember(m: any) {
    this.selectedMember = m;
    this.viewTab = 'info';
    this.loadMemberDetails(m.id);
  }

  switchTab(tab: string) {
    this.viewTab = tab;
    if (!this.selectedMember) return;
    const id = this.selectedMember.id;
    if (tab === 'donations') {
      this.loadMemberDonations(id);
    } else if (tab === 'receipts') {
      this.loadMemberReceipts(id);
    } else if (tab === 'departments') {
      this.loadMemberDepartments(id);
    } else if (tab === 'transfers') {
      this.loadMemberTransfers(id);
    }
  }

  loadMemberDetails(memberId: number) {
    this.api.getMember(memberId).subscribe({
      next: (detail: any) => {
        this.selectedMember = { ...this.selectedMember, ...detail };
        if (detail.transfer_history) {
          this.memberTransfers = detail.transfer_history;
        }
      },
      error: () => {}
    });
  }

  loadMemberDonations(memberId: number) {
    this.loadingDonations = true;
    this.api.getMemberDonations(memberId).subscribe({
      next: (res: any) => {
        this.memberDonations = Array.isArray(res) ? res : (res.results || []);
        this.loadingDonations = false;
      },
      error: () => { this.memberDonations = []; this.loadingDonations = false; }
    });
  }

  downloadMemberReceipt(donationId: number) {
    this.api.getDonationReceipt(donationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-${donationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
      },
      error: () => { this.toast.error('Impossible de telecharger le recu'); }
    });
  }

  loadMemberDepartments(memberId: number) {
    this.loadingDepartments = true;
    this.api.getMemberDepartments(memberId).subscribe({
      next: (res: any) => { this.memberDepartments = Array.isArray(res) ? res : (res.results || []); this.loadingDepartments = false; },
      error: () => { this.memberDepartments = []; this.loadingDepartments = false; }
    });
  }

  loadMemberTransfers(memberId: number) {
    this.loadingTransfers = true;
    this.api.getMember(memberId).subscribe({
      next: (detail: any) => {
        this.memberTransfers = detail.transfer_history || [];
        this.loadingTransfers = false;
      },
      error: () => { this.memberTransfers = []; this.loadingTransfers = false; }
    });
  }

  loadMemberReceipts(memberId: number) {
    this.loadingReceipts = true;
    this.api.getMemberReceipts(memberId).subscribe({
      next: (res: any) => { this.memberReceipts = Array.isArray(res) ? res : (res.results || []); this.loadingReceipts = false; },
      error: () => { this.memberReceipts = []; this.loadingReceipts = false; }
    });
  }

  downloadReceipt(receipt: any) {
    this.api.downloadReceipt(receipt.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu_${receipt.receipt_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
        this.toast.success('Recu telecharge avec succes');
      },
      error: () => { this.toast.error('Erreur lors du telechargement du recu'); }
    });
  }

  openTransferModal(member: any) {
    this.transferMemberData = member;
    this.transferForm = { new_church_id: null, reason: '', notes: '' };
    this.showTransfer = true;
  }

  submitTransfer() {
    if (!this.transferMemberData || !this.transferForm.new_church_id) return;
    this.transferring = true;
    this.api.transferMember(this.transferMemberData.id, this.transferForm).subscribe({
      next: () => {
        this.showTransfer = false;
        this.transferring = false;
        this.transferMemberData = null;
        if (this.selectedMember && this.selectedMember.id === this.transferMemberData?.id) {
          this.loadMemberTransfers(this.selectedMember.id);
        }
        this.load();
      },
      error: (err) => {
        this.transferring = false;
        this.toast.error(err.error?.detail || 'Erreur lors du transfert');
      }
    });
  }

  save() {
    const payload = { ...this.form };
    if (!payload.church) {
      payload.church = this.defaultChurchId;
    }
    const obs = this.editData
      ? this.api.updateMember(this.editData.id, payload)
      : this.api.createMember(payload);
    obs.subscribe({
      next: () => { this.showForm = false; this.editData = null; this.load(); this.toast.success('Membre sauvegarde avec succes'); },
      error: (err) => {
        const errors = err.error;
        let msg = 'Erreur lors de la sauvegarde';
        if (errors?.detail) {
          msg = errors.detail;
        } else if (typeof errors === 'object' && errors !== null) {
          const fields = Object.entries(errors).map(([k, v]: any) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
          if (fields) msg = fields;
        }
        this.toast.error(msg);
      }
    });
  }

  archiveMember(m: any) {
    if (confirm(`Voulez-vous vraiment archiver ${m.full_name} ?`)) {
      this.api.updateMember(m.id, { status: 'ARCHIVED' }).subscribe({
        next: () => { this.load(); this.toast.success('Membre archive avec succes'); },
        error: (err) => this.toast.error(err.error?.detail || 'Erreur lors de l\'archivage')
      });
    }
  }

  exportMembers() {
    this.api.exportMembersExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'membres.xlsx';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
        this.toast.success('Export termine');
      },
      error: () => this.toast.error('Erreur lors de l\'export')
    });
  }

  importMembers(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.importing = true;
    this.api.importMembersExcel(file).subscribe({
      next: (res: any) => {
        this.importing = false;
        this.showImport = false;
        this.toast.success(`${res.created} membre(s) importe(s)`);
        if (res.errors?.length) {
          this.toast.warning(`${res.total_errors} erreur(s) rencontree(s)`);
        }
        this.load();
        input.value = '';
      },
      error: () => {
        this.importing = false;
        this.toast.error('Erreur lors de l\'import');
        input.value = '';
      }
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount || 0);
  }

  getDonationTotal(): number {
    return this.memberDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  }

  getDonationStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente', VALIDATED: 'Valide', CANCELLED: 'Annule', APPROVED: 'Approuve'
    };
    return labels[status] || status || 'En attente';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Actif', INACTIVE: 'Inactif', TRANSFERRED: 'Transfere',
      SUSPENDED: 'Suspendu', DECEASED: 'Decede', ARCHIVED: 'Archive',
      PROSPECT: 'Prospect'
    };
    return labels[status] || status;
  }

  getMaritalLabel(status: string): string {
    const labels: Record<string, string> = {
      SINGLE: 'Celibataire', MARRIED: 'Marie(e)', DIVORCED: 'Divorce(e)',
      WIDOWED: 'Veuf/Veuve', OTHER: 'Autre'
    };
    return labels[status] || status || '-';
  }
}
