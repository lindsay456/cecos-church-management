import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Departements</h2>
        <p class="page-subtitle">Gerez les departements et leur plan d'activites</p>
      </div>
      <div class="header-actions">
        <div class="tabs">
          <button [class.active]="activeTab === 'list'" (click)="activeTab = 'list'">Departements</button>
          <button [class.active]="activeTab === 'members'" (click)="activeTab = 'members'; loadDeptMembers()">Membres</button>
          <button [class.active]="activeTab === 'plan'" (click)="activeTab = 'plan'; loadPlans()">Plan annuel</button>
        </div>
        <button class="btn-primary" (click)="activeTab === 'list' ? openForm() : activeTab === 'members' ? openAssignModal() : openPlanForm()">+ {{ activeTab === 'list' ? 'Departement' : activeTab === 'members' ? 'Affecter' : 'Activite' }}</button>
      </div>
    </div>

    <!-- DEPARTMENTS TAB - CARDS -->
    <div *ngIf="activeTab === 'list'">
      <div class="filters-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input [(ngModel)]="search" (input)="filterList()" placeholder="Rechercher..." class="search-input">
        </div>
      </div>

      <div class="dept-grid" *ngIf="filtered.length">
        <div class="dept-card" *ngFor="let d of filtered">
          <div class="dept-card-header">
            <div class="dept-icon" [style.background]="getDeptColor(d.department_type)">
              <span class="dept-initial">{{ d.name?.charAt(0) }}</span>
            </div>
            <div class="dept-actions">
              <button class="btn-icon" title="Modifier" (click)="openForm(d)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="btn-icon btn-danger" title="Supprimer" (click)="confirmDelete(d)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </div>
          <div class="dept-card-body">
            <h4>{{ d.name }}</h4>
            <span class="dept-type">{{ typeLabel(d.department_type) }}</span>
            <div class="dept-meta">
              <div class="meta-row" *ngIf="d.leader_name">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <span>{{ d.leader_name }}</span>
              </div>
              <div class="meta-row" *ngIf="d.annual_budget">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="var(--gray-400)"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                <span>{{ d.annual_budget | number:'1.0-0' }} FCFA</span>
              </div>
            </div>
          </div>
          <div class="dept-card-footer">
            <span class="badge" [class.badge-active]="d.is_active" [class.badge-inactive]="!d.is_active">{{ d.is_active ? 'Actif' : 'Inactif' }}</span>
          </div>
        </div>
      </div>
      <div class="empty-state" *ngIf="!loading && !filtered.length">
        <h3>Aucun departement</h3><p>Commencez par creer un departement.</p>
      </div>
    </div>

    <!-- ANNUAL PLAN TAB -->
    <div *ngIf="activeTab === 'plan'">
      <div class="filters-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input [(ngModel)]="planSearch" (input)="filterPlans()" placeholder="Rechercher une activite..." class="search-input">
        </div>
        <select [(ngModel)]="planFilterYear" (change)="filterPlans()">
          <option value="">Toutes les annees</option>
          <option *ngFor="let y of planYears" [value]="y">{{ y }}</option>
        </select>
      </div>

      <div class="table-container" *ngIf="filteredPlans.length">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Titre</th><th>Departement</th><th>Responsable</th><th>Budget</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredPlans">
              <td>{{ p.planned_date || '-' }}</td>
              <td><strong>{{ p.title }}</strong></td>
              <td>{{ getDeptName(p.department) }}</td>
              <td>{{ p.responsible_name || '-' }}</td>
              <td>{{ p.budget ? (p.budget | number:'1.0-0') + ' FCFA' : '-' }}</td>
              <td><span class="badge" [ngClass]="planStatusClass(p.status)">{{ planStatusLabel(p.status) }}</span></td>
              <td class="actions">
                <button class="btn-icon" (click)="openPlanForm(p)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
                <button class="btn-icon btn-danger" (click)="deletePlan(p)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty-state" *ngIf="!plansLoading && !filteredPlans.length">
        <h3>Aucune activite planifiee</h3><p>Ajoutez des activites au plan annuel de vos departements.</p>
      </div>
    </div>

    <!-- DEPT MEMBERS TAB -->
    <div *ngIf="activeTab === 'members'">
      <div class="filters-bar">
        <select [(ngModel)]="memberFilterDept" (change)="filterDeptMembers()">
          <option value="">Tous les departements</option>
          <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
        </select>
        <div class="search-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input [(ngModel)]="memberSearch" (input)="filterDeptMembers()" placeholder="Rechercher un membre..." class="search-input">
        </div>
      </div>

      <div class="table-container" *ngIf="filteredMembers.length">
        <table>
          <thead>
            <tr>
              <th>Membre</th><th>Departement</th><th>Role</th><th>Annee</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of filteredMembers">
              <td><strong>{{ m.member_name }}</strong><br><span class="text-muted">{{ m.member_number }}</span></td>
              <td>{{ getDeptName(m.department) }}</td>
              <td><span class="badge badge-role">{{ m.role_in_department || 'Membre' }}</span></td>
              <td>{{ m.year }}</td>
              <td><span class="badge" [class.badge-active]="m.is_active" [class.badge-inactive]="!m.is_active">{{ m.is_active ? 'Actif' : 'Inactif' }}</span></td>
              <td class="actions">
                <button class="btn-icon btn-danger" title="Retirer" (click)="confirmRemoveMember(m)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty-state" *ngIf="!loading && !filteredMembers.length">
        <h3>Aucun membre assigne</h3><p>Assignez des membres a vos departements.</p>
      </div>
    </div>

    <!-- ASSIGN MEMBER MODAL -->
    <div class="modal-overlay" *ngIf="showAssignModal" (click)="closeAssignModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Affecter un membre a un departement</h3>
          <button class="btn-close" (click)="closeAssignModal()">&times;</button>
        </div>
        <form (ngSubmit)="saveAssignment()">
          <div class="form-group"><label>Departement *</label>
            <select [(ngModel)]="assignForm.department" name="department" required>
              <option value="">Selectionner un departement...</option>
              <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div class="form-group"><label>Membre *</label>
            <select [(ngModel)]="assignForm.member" name="member" required>
              <option value="">Selectionner un membre...</option>
              <option *ngFor="let m of members" [value]="m.id">{{ m.first_name }} {{ m.last_name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Role</label>
              <select [(ngModel)]="assignForm.role_in_department" name="role_in_department">
                <option value="MEMBER">Membre</option>
                <option value="SECRETARY">Secretaire</option>
                <option value="TREASURER">Tresorier</option>
                <option value="COORDINATOR">Coordinateur</option>
                <option value="ADJUNCT">Adjoint</option>
              </select>
            </div>
            <div class="form-group"><label>Annee *</label><input type="number" [(ngModel)]="assignForm.year" name="year" required></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closeAssignModal()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">Affecter</button>
          </div>
        </form>
      </div>
    </div>

    <!-- REMOVE MEMBER CONFIRM -->
    <div class="modal-overlay" *ngIf="removingMember" (click)="removingMember = null">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>Retirer le membre</h3><button class="btn-close" (click)="removingMember = null">&times;</button></div>
        <p>Voulez-vous retirer <strong>{{ removingMember?.member_name }}</strong> du departement <strong>{{ getDeptName(removingMember?.department) }}</strong> ?</p>
        <div class="form-actions">
          <button class="btn-secondary" (click)="removingMember = null">Annuler</button>
          <button class="btn-danger" (click)="removeMember()">Retirer</button>
        </div>
      </div>
    </div>

    <!-- DEPT FORM MODAL -->
    <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Modifier le departement' : 'Nouveau departement' }}</h3>
          <button class="btn-close" (click)="closeForm()">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group"><label>Nom *</label><input [(ngModel)]="form.name" name="name" required></div>
            <div class="form-group"><label>Code *</label><input [(ngModel)]="form.code" name="code" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Type</label>
              <select [(ngModel)]="form.department_type" name="department_type">
                <option value="ADMINISTRATION">Administration</option><option value="WORSHIP">Culte et adoration</option>
                <option value="MUSIC">Musique</option><option value="YOUTH">Jeunesse</option>
                <option value="SABBATH_SCHOOL">Ecole du Sabbat</option><option value="CHILDREN">Enfants</option>
                <option value="WOMEN">Femmes</option><option value="MEN">Hommes</option>
                <option value="SOCIAL">Action sociale</option><option value="COMMUNICATION">Communication</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div class="form-group"><label>Budget annuel (FCFA)</label><input type="number" [(ngModel)]="form.annual_budget" name="annual_budget" min="0"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Date debut *</label><input type="date" [(ngModel)]="form.start_date" name="start_date" required></div>
            <div class="form-group"><label>Date fin</label><input type="date" [(ngModel)]="form.end_date" name="end_date"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Eglise *</label>
              <select [(ngModel)]="form.church" name="church" required>
                <option value="">Selectionner...</option>
                <option *ngFor="let e of entities" [value]="e.id">{{ e.name }}</option>
              </select>
            </div>
            <div class="form-group"><label>Statut</label>
              <select [(ngModel)]="form.is_active" name="is_active">
                <option [ngValue]="true">Actif</option>
                <option [ngValue]="false">Inactif</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Notes</label><textarea [(ngModel)]="form.notes" name="notes" rows="3"></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closeForm()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ editing ? 'Enregistrer' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- PLAN FORM MODAL -->
    <div class="modal-overlay" *ngIf="showPlanForm" (click)="closePlanForm()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editingPlan ? "Modifier l'activite" : 'Nouvelle activite' }}</h3>
          <button class="btn-close" (click)="closePlanForm()">&times;</button>
        </div>
        <form (ngSubmit)="savePlan()">
          <div class="form-group"><label>Titre *</label><input [(ngModel)]="planForm.title" name="title" required></div>
          <div class="form-row">
            <div class="form-group"><label>Departement *</label>
              <select [(ngModel)]="planForm.department" name="department" required>
                <option value="">Selectionner...</option>
                <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div class="form-group"><label>Annee *</label><input type="number" [(ngModel)]="planForm.year" name="year" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Date prevue</label><input type="date" [(ngModel)]="planForm.planned_date" name="planned_date"></div>
            <div class="form-group"><label>Statut</label>
              <select [(ngModel)]="planForm.status" name="status">
                <option value="PLANNED">Planifie</option><option value="IN_PROGRESS">En cours</option>
                <option value="DONE">Termine</option><option value="CANCELLED">Annule</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Budget prevu (FCFA)</label><input type="number" [(ngModel)]="planForm.budget" name="budget" min="0"></div>
            <div class="form-group"><label>Responsable</label>
              <select [(ngModel)]="planForm.responsible" name="responsible">
                <option value="">Selectionner...</option>
                <option *ngFor="let m of members" [value]="m.id">{{ m.first_name }} {{ m.last_name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Description</label><textarea [(ngModel)]="planForm.description" name="description" rows="3"></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closePlanForm()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ editingPlan ? 'Enregistrer' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRM -->
    <div class="modal-overlay" *ngIf="deleting" (click)="deleting = null">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>Confirmer</h3><button class="btn-close" (click)="deleting = null">&times;</button></div>
        <p>Voulez-vous supprimer <strong>{{ deleting.name }}</strong> ?</p>
        <div class="form-actions">
          <button class="btn-secondary" (click)="deleting = null">Annuler</button>
          <button class="btn-danger" (click)="delete()">Supprimer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 22px; color: var(--gray-900); }
      .page-subtitle { font-size: 13px; color: var(--gray-400); margin: 2px 0 0; }
    }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .tabs { display: flex; background: var(--gray-100); border-radius: var(--radius-sm); padding: 3px;
      button { padding: 8px 16px; border: none; background: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--gray-500); font-family: var(--font-family);
        &.active { background: var(--white); color: var(--primary); box-shadow: var(--shadow-sm); }
      }
    }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 8px; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 10px 14px;
      svg { flex-shrink: 0; }
      .search-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: var(--font-family); }
    }

    .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .dept-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100); overflow: hidden; transition: all 0.15s;
      &:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
    }
    .dept-card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 20px 0; }
    .dept-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .dept-initial { font-size: 20px; font-weight: 700; color: #fff; }
    .dept-actions { display: flex; gap: 4px; }
    .dept-card-body { padding: 16px 20px; }
    .dept-card-body h4 { margin: 0 0 4px; font-size: 16px; color: var(--gray-900); }
    .dept-type { font-size: 12px; color: var(--gray-500); font-weight: 500; }
    .dept-meta { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
    .meta-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-600); }
    .dept-card-footer { padding: 12px 20px; border-top: 1px solid var(--gray-100); background: var(--gray-50); }

    .table-container { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--gray-50); padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 16px; border-top: 1px solid var(--gray-100); font-size: 14px; }
    .actions { display: flex; gap: 4px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-role { background: #DBEAFE; color: #1E40AF; }
    .badge-active { background: #DCFCE7; color: #166534; }
    .badge-inactive { background: var(--gray-100); color: var(--gray-500); }
    .text-muted { font-size: 12px; color: var(--gray-400); }
    .badge-planned { background: #DBEAFE; color: #1E40AF; }
    .badge-progress { background: #FEF3C7; color: #92400E; }
    .badge-done { background: #DCFCE7; color: #166534; }
    .badge-cancelled { background: #FEE2E2; color: #991B1B; }
    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-family);
      &:hover { background: var(--primary-hover); } &:disabled { opacity: 0.6; }
    }
    .btn-secondary { padding: 10px 16px; background: var(--gray-100); color: var(--gray-700); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-family: var(--font-family); }
    .btn-danger { padding: 10px 20px; background: var(--red); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; font-family: var(--font-family); }
    .btn-icon { width: 32px; height: 32px; border: none; background: var(--gray-50); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray-500);
      &:hover { background: var(--gray-100); color: var(--primary); }
    }
    .btn-icon.btn-danger { background: #FEF2F2; color: var(--red); &:hover { background: #FEE2E2; } }
    .btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-400); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal { background: var(--white); border-radius: var(--radius); padding: 28px; width: 100%; max-width: 580px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-sm { max-width: 400px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h3 { margin: 0; font-size: 20px; } }
    .form-group { margin-bottom: 14px; label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-600); margin-bottom: 5px; }
      input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; box-sizing: border-box; font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      }
    }
    .form-row { display: flex; gap: 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-100); }
    .empty-state { text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-sm);
      h3 { margin: 12px 0 4px; font-size: 16px; } p { color: var(--gray-500); font-size: 14px; }
    }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
      .header-actions { flex-direction: column; width: 100%; }
      .tabs { width: 100%; button { flex: 1; } }
      .filters-bar { flex-direction: column; }
      .dept-grid { grid-template-columns: 1fr; }
      .form-row { flex-direction: column; }
    }
  `]
})
export class DepartmentsComponent implements OnInit {
  departments: any[] = [];
  filtered: any[] = [];
  entities: any[] = [];
  members: any[] = [];
  plans: any[] = [];
  filteredPlans: any[] = [];
  deptMembers: any[] = [];
  filteredMembers: any[] = [];
  memberFilterDept = '';
  memberSearch = '';
  showAssignModal = false;
  removingMember: any = null;
  assignForm: any = { department: '', member: '', role: 'MEMBER', year: new Date().getFullYear() };
  planYears: number[] = [];
  search = '';
  planSearch = '';
  planFilterYear = '';
  loading = false;
  plansLoading = false;
  showForm = false;
  showPlanForm = false;
  saving = false;
  editing: any = null;
  editingPlan: any = null;
  deleting: any = null;
  activeTab: 'list' | 'plan' = 'list';
  form: any = this.getEmptyForm();
  planForm: any = this.getEmptyPlanForm();

  private typeLabels: Record<string, string> = {
    ADMINISTRATION: 'Administration', WORSHIP: 'Culte et adoration', MUSIC: 'Musique',
    YOUTH: 'Jeunesse', SABBATH_SCHOOL: 'Ecole du Sabbat', CHILDREN: 'Enfants',
    WOMEN: 'Femmes', MEN: 'Hommes', SOCIAL: 'Action sociale', COMMUNICATION: 'Communication', OTHER: 'Autre'
  };
  private deptColors: Record<string, string> = {
    ADMINISTRATION: '#475569', WORSHIP: '#2563EB', MUSIC: '#7C3AED', YOUTH: '#D946EF',
    SABBATH_SCHOOL: '#059669', CHILDREN: '#EA580C', WOMEN: '#E11D48', MEN: '#0891B2',
    SOCIAL: '#CA8A04', COMMUNICATION: '#6366F1', OTHER: '#6B7280'
  };

  constructor(private api: ApiService, private toast: ToastService) {}
  ngOnInit() {
    this.load();
    this.api.getEntities().subscribe({ next: (res: any) => this.entities = res.results || res || [] });
    this.api.getMembers().subscribe({ next: (res: any) => this.members = res.results || res || [] });
  }

  getEmptyForm() {
    return { name: '', code: '', department_type: 'OTHER', is_active: true, annual_budget: null, start_date: '', end_date: '', church: '', notes: '' };
  }
  getEmptyPlanForm() {
    return { title: '', department: '', year: new Date().getFullYear(), planned_date: '', status: 'PLANNED', responsible: '', budget: null, description: '' };
  }

  load() {
    this.loading = true;
    this.api.getDepartments().subscribe({
      next: (res: any) => { this.departments = res.results || res || []; this.filterList(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadPlans() {
    this.plansLoading = true;
    this.api.getAnnualPlans().subscribe({
      next: (res: any) => { this.plans = res.results || res || []; this.planYears = [...new Set(this.plans.map((p: any) => p.year))].sort((a: number, b: number) => b - a); this.filterPlans(); this.plansLoading = false; },
      error: () => { this.plansLoading = false; }
    });
  }

  filterList() { const q = this.search.toLowerCase(); this.filtered = this.departments.filter(d => !q || d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q)); }
  filterPlans() { const q = this.planSearch.toLowerCase(); this.filteredPlans = this.plans.filter(p => (!q || p.title?.toLowerCase().includes(q)) && (!this.planFilterYear || String(p.year) === this.planFilterYear)); }

  typeLabel(type: string): string { return this.typeLabels[type] || type; }
  getDeptColor(type: string): string { return this.deptColors[type] || '#6B7280'; }
  getDeptName(id: number): string { return this.departments.find(d => d.id === id)?.name || ''; }
  planStatusLabel(s: string): string { return { PLANNED: 'Planifie', IN_PROGRESS: 'En cours', DONE: 'Termine', CANCELLED: 'Annule' }[s] || s; }
  planStatusClass(s: string): string { return { PLANNED: 'badge-planned', IN_PROGRESS: 'badge-progress', DONE: 'badge-done', CANCELLED: 'badge-cancelled' }[s] || ''; }

  openForm(dept?: any) {
    this.editing = dept || null;
    this.form = dept ? { ...dept, annual_budget: dept.annual_budget || null, start_date: dept.start_date || '', end_date: dept.end_date || '', notes: dept.notes || '' } : this.getEmptyForm();
    this.showForm = true;
  }
  closeForm() { this.showForm = false; this.editing = null; }

  save() {
    this.saving = true;
    const req = this.editing ? this.api.updateDepartment(this.editing.id, this.form) : this.api.createDepartment(this.form);
    req.subscribe({
      next: () => { this.closeForm(); this.saving = false; this.load(); this.toast.success(this.editing ? 'Departement modifie' : 'Departement cree'); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  confirmDelete(dept: any) { this.deleting = dept; }
  delete() {
    if (!this.deleting) return;
    this.api.deleteDepartment(this.deleting.id).subscribe({
      next: () => { this.deleting = null; this.load(); this.toast.success('Departement supprime'); },
      error: (err) => { this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  openPlanForm(plan?: any) { this.editingPlan = plan || null; this.planForm = plan ? { ...plan } : this.getEmptyPlanForm(); this.showPlanForm = true; }
  closePlanForm() { this.showPlanForm = false; this.editingPlan = null; }

  savePlan() {
    this.saving = true;
    const req = this.editingPlan ? this.api.updateAnnualPlan(this.editingPlan.id, this.planForm) : this.api.createAnnualPlan(this.planForm);
    req.subscribe({
      next: () => { this.closePlanForm(); this.saving = false; this.loadPlans(); this.toast.success('Activite enregistree'); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  deletePlan(plan: any) {
    this.api.deleteAnnualPlan(plan.id).subscribe({
      next: () => { this.loadPlans(); this.toast.success('Activite supprimee'); },
      error: (err) => { this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  loadDeptMembers() {
    this.loading = true;
    this.api.getDepartmentMemberships().subscribe({
      next: (res: any) => { this.deptMembers = res.results || res || []; this.filterDeptMembers(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filterDeptMembers() {
    const q = this.memberSearch.toLowerCase();
    this.filteredMembers = this.deptMembers.filter(m =>
      (!q || m.member_name?.toLowerCase().includes(q) || m.member_number?.toLowerCase().includes(q)) &&
      (!this.memberFilterDept || String(m.department) === this.memberFilterDept)
    );
  }

  openAssignModal() {
    this.assignForm = { department: this.memberFilterDept || '', member: '', role_in_department: 'MEMBER', year: new Date().getFullYear() };
    this.showAssignModal = true;
  }

  closeAssignModal() { this.showAssignModal = false; }

  saveAssignment() {
    this.saving = true;
    this.api.createDepartmentMembership(this.assignForm).subscribe({
      next: () => { this.closeAssignModal(); this.saving = false; this.loadDeptMembers(); this.toast.success('Membre affecte'); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  confirmRemoveMember(m: any) { this.removingMember = m; }

  removeMember() {
    if (!this.removingMember) return;
    this.api.deleteDepartmentMembership(this.removingMember.id).subscribe({
      next: () => { this.removingMember = null; this.loadDeptMembers(); this.toast.success('Membre retire'); },
      error: (err) => { this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }
}
