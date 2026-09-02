import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Calendrier des Activites</h2>
        <p class="page-subtitle">Planifiez et suivez les evenements de votre eglise</p>
      </div>
      <div class="header-actions">
        <div class="view-toggle">
          <button [class.active]="viewMode === 'calendar'" (click)="viewMode = 'calendar'">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
            Calendrier
          </button>
          <button [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
            Liste
          </button>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Evenement</button>
      </div>
    </div>

    <!-- CALENDAR VIEW -->
    <div *ngIf="viewMode === 'calendar'" class="calendar-container">
      <div class="calendar-sidebar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input [(ngModel)]="search" (input)="filterList()" placeholder="Rechercher un evenement..." class="search-input">
        </div>

        <div class="categories-section">
          <div class="categories-header">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
            <span>CATEGORIES</span>
            <button class="reset-btn" (click)="filterType = ''; filterList()">Reinitialiser</button>
          </div>
          <div class="category-tags">
            <button class="cat-tag" [class.active]="filterType === ''" (click)="filterType = ''; filterList()">Tous</button>
            <button class="cat-tag" [class.active]="filterType === 'WORSHIP'" (click)="filterType = 'WORSHIP'; filterList()">Culte</button>
            <button class="cat-tag" [class.active]="filterType === 'YOUTH'" (click)="filterType = 'YOUTH'; filterList()">Jeunesse</button>
            <button class="cat-tag" [class.active]="filterType === 'TRAINING'" (click)="filterType = 'TRAINING'; filterList()">Etude</button>
            <button class="cat-tag" [class.active]="filterType === 'MEETING'" (click)="filterType = 'MEETING'; filterList()">Musique</button>
          </div>
        </div>

        <div class="next-events" *ngIf="filtered.length">
          <h4>Prochains rendez-vous</h4>
          <div class="next-event-item" *ngFor="let e of filtered.slice(0, 4)">
            <div class="next-dot" [style.background]="getEventColor(e.event_type)"></div>
            <div class="next-info">
              <strong>{{ e.title }}</strong>
              <span>{{ e.start_datetime | date:'dd MMM, HH:mm' }} {{ e.location ? '- ' + e.location : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-main">
        <div class="calendar-nav">
          <button class="nav-btn" (click)="prevMonth()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <h3>{{ monthNames[currentMonth] }} {{ currentYear }}</h3>
          <button class="nav-btn" (click)="nextMonth()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>

        <div class="calendar-grid">
          <div class="weekday-header" *ngFor="let day of weekDays">{{ day }}</div>
          <div class="calendar-day" *ngFor="let day of calendarDays"
               [class.other-month]="day.otherMonth"
               [class.today]="day.isToday"
               (click)="selectDay(day)">
            <span class="day-number">{{ day.date }}</span>
            <div class="day-events">
              <div class="event-dot" *ngFor="let evt of day.events" [style.background]="getEventColor(evt.event_type)"
                   [title]="evt.title" (click)="viewEvent(evt); $event.stopPropagation()"></div>
            </div>
          </div>
        </div>

        <div class="selected-day-events" *ngIf="selectedDay && selectedDay.events.length">
          <h4>{{ selectedDay.fullDate | date:'EEEE d MMMM yyyy' }}</h4>
          <div class="day-event-card" *ngFor="let evt of selectedDay.events" (click)="viewEvent(evt)">
            <div class="event-color-bar" [style.background]="getEventColor(evt.event_type)"></div>
            <div class="event-content">
              <strong>{{ evt.title }}</strong>
              <span>{{ typeLabel(evt.event_type) }} &bull; {{ evt.start_datetime | date:'HH:mm' }} - {{ evt.end_datetime | date:'HH:mm' }}</span>
              <span *ngIf="evt.location">{{ evt.location }}</span>
            </div>
            <span class="badge" [ngClass]="'badge-' + (evt.status || 'draft').toLowerCase()">{{ statusLabel(evt.status) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LIST VIEW -->
    <div *ngIf="viewMode === 'list'">
      <div class="filters-bar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--gray-400)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input [(ngModel)]="search" (input)="filterList()" placeholder="Rechercher..." class="search-input">
        </div>
        <select [(ngModel)]="filterStatus" (change)="filterList()">
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PLANNED">Planifie</option>
          <option value="PUBLISHED">Publie</option>
          <option value="COMPLETED">Termine</option>
          <option value="CANCELLED">Annule</option>
        </select>
      </div>

      <div class="events-list" *ngIf="filtered.length">
        <div class="event-card" *ngFor="let e of filtered">
          <div class="event-date-box" [ngClass]="'date-' + (e.status || 'planned').toLowerCase()">
            <span class="day">{{ e.start_datetime | date:'dd' }}</span>
            <span class="month">{{ e.start_datetime | date:'MMM' }}</span>
          </div>
          <div class="event-details">
            <h4>{{ e.title }}</h4>
            <div class="event-meta">
              <span class="meta-item">{{ typeLabel(e.event_type) }}</span>
              <span class="meta-item" *ngIf="e.location">{{ e.location }}</span>
              <span class="meta-item">{{ e.start_datetime | date:'HH:mm' }} - {{ e.end_datetime | date:'HH:mm' }}</span>
              <span class="meta-item" *ngIf="e.expected_budget">{{ e.expected_budget | number:'1.0-0' }} FCFA</span>
            </div>
          </div>
          <div class="event-actions">
            <span class="badge" [ngClass]="'badge-' + (e.status || 'draft').toLowerCase()">{{ statusLabel(e.status) }}</span>
            <div class="action-btns">
              <button class="btn-icon" title="Modifier" (click)="openForm(e)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="btn-icon btn-danger" title="Supprimer" (click)="confirmDelete(e)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && !filtered.length">
        <h3>Aucun evenement</h3><p>Commencez par planifier un evenement.</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? "Modifier l'evenement" : 'Nouvel evenement' }}</h3>
          <button class="btn-close" (click)="closeForm()">&times;</button>
        </div>
        <form (ngSubmit)="save()">
          <div class="form-group"><label>Titre *</label><input [(ngModel)]="form.title" name="title" required placeholder="Ex: Culte du dimanche"></div>
          <div class="form-row">
            <div class="form-group"><label>Type *</label>
              <select [(ngModel)]="form.event_type" name="event_type" required>
                <option value="WORSHIP">Culte</option><option value="MEETING">Reunion</option><option value="CONFERENCE">Conference</option>
                <option value="OUTREACH">Evangelisation</option><option value="YOUTH">Jeunesse</option><option value="CHARITY">Charite</option>
                <option value="TRAINING">Formation</option><option value="CELEBRATION">Celebration</option><option value="OTHER">Autre</option>
              </select>
            </div>
            <div class="form-group"><label>Statut</label>
              <select [(ngModel)]="form.status" name="status">
                <option value="DRAFT">Brouillon</option><option value="PLANNED">Planifie</option><option value="PUBLISHED">Publie</option>
                <option value="COMPLETED">Termine</option><option value="CANCELLED">Annule</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Debut *</label><input type="datetime-local" [(ngModel)]="form.start_datetime" name="start_datetime" required></div>
            <div class="form-group"><label>Fin *</label><input type="datetime-local" [(ngModel)]="form.end_datetime" name="end_datetime" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Lieu</label><input [(ngModel)]="form.location" name="location" placeholder="Ex: Salle paroissiale"></div>
            <div class="form-group"><label>Eglise *</label>
              <select [(ngModel)]="form.church" name="church" required>
                <option value="">Selectionner...</option>
                <option *ngFor="let e of entities" [value]="e.id">{{ e.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Budget prevu (FCFA)</label><input type="number" [(ngModel)]="form.expected_budget" name="expected_budget" min="0"></div>
            <div class="form-group"><label>Budget reel (FCFA)</label><input type="number" [(ngModel)]="form.actual_budget" name="actual_budget" min="0"></div>
          </div>
          <div class="form-group"><label>Description</label><textarea [(ngModel)]="form.description" name="description" rows="3"></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="closeForm()">Annuler</button>
            <button type="submit" class="btn-primary" [disabled]="saving">{{ editing ? 'Enregistrer' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div class="modal-overlay" *ngIf="deleting" (click)="deleting = null">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>Confirmer</h3><button class="btn-close" (click)="deleting = null">&times;</button></div>
        <p>Voulez-vous supprimer <strong>{{ deleting.title }}</strong> ?</p>
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
    .view-toggle { display: flex; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); overflow: hidden;
      button { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; background: none; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--gray-500); font-family: var(--font-family);
        &.active { background: var(--primary); color: #fff; }
      }
    }

    .calendar-container { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
    .calendar-sidebar { background: var(--white); border-radius: var(--radius); padding: 20px; border: 1px solid var(--gray-100); box-shadow: var(--shadow-sm); height: fit-content; }
    .search-box { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--gray-50); border-radius: var(--radius-sm); margin-bottom: 20px;
      .search-input { flex: 1; border: none; outline: none; font-size: 14px; background: none; font-family: var(--font-family); }
    }
    .categories-section { margin-bottom: 24px; }
    .categories-header { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .reset-btn { margin-left: auto; background: none; border: none; font-size: 12px; color: var(--primary); cursor: pointer; font-family: var(--font-family); }
    .category-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .cat-tag { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--gray-200); background: var(--white); font-size: 13px; cursor: pointer; font-family: var(--font-family); color: var(--gray-600); transition: all 0.15s;
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); color: #fff; border-color: var(--primary); }
    }
    .next-events { h4 { font-size: 14px; color: var(--gray-700); margin: 0 0 12px; } }
    .next-event-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--gray-50); &:last-child { border: none; } }
    .next-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .next-info { display: flex; flex-direction: column; gap: 2px;
      strong { font-size: 13px; color: var(--gray-800); }
      span { font-size: 12px; color: var(--gray-400); }
    }

    .calendar-main { background: var(--white); border-radius: var(--radius); padding: 20px; border: 1px solid var(--gray-100); box-shadow: var(--shadow-sm); }
    .calendar-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h3 { margin: 0; font-size: 20px; font-weight: 700; color: var(--gray-900); } }
    .nav-btn { width: 36px; height: 36px; border: 1px solid var(--gray-200); border-radius: 8px; background: var(--white); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--gray-600);
      &:hover { background: var(--gray-50); border-color: var(--gray-300); }
    }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--gray-100); border-radius: 8px; overflow: hidden; }
    .weekday-header { padding: 10px; text-align: center; font-size: 12px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; background: var(--gray-50); }
    .calendar-day { min-height: 80px; padding: 8px; background: var(--white); cursor: pointer; transition: background 0.1s;
      &:hover { background: var(--gray-50); }
      &.other-month { background: var(--gray-50); .day-number { color: var(--gray-300); } }
      &.today { background: rgba(37,99,235,0.05); .day-number { background: var(--primary); color: #fff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; } }
    }
    .day-number { font-size: 14px; font-weight: 500; color: var(--gray-700); display: block; margin-bottom: 4px; }
    .day-events { display: flex; flex-wrap: wrap; gap: 3px; }
    .event-dot { width: 8px; height: 8px; border-radius: 50%; cursor: pointer; transition: transform 0.1s; &:hover { transform: scale(1.5); } }

    .selected-day-events { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--gray-100);
      h4 { margin: 0 0 12px; font-size: 15px; color: var(--gray-700); }
    }
    .day-event-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--gray-50); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.15s;
      &:hover { background: var(--gray-100); }
    }
    .event-color-bar { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; }
    .event-content { flex: 1; display: flex; flex-direction: column; gap: 2px;
      strong { font-size: 14px; color: var(--gray-900); }
      span { font-size: 12px; color: var(--gray-500); }
    }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 8px; background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-sm); padding: 10px 14px;
      svg { flex-shrink: 0; }
      .search-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: var(--font-family); }
    }
    select { padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm); font-size: 14px; background: var(--white); font-family: var(--font-family); }

    .events-list { display: flex; flex-direction: column; gap: 10px; }
    .event-card { background: var(--white); border-radius: var(--radius); padding: 16px 20px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 16px; border: 1px solid var(--gray-100); }
    .event-date-box { border-radius: 12px; padding: 10px 14px; text-align: center; min-width: 56px;
      &.date-draft, &.date-DRAFT { background: var(--gray-100); .day, .month { color: var(--gray-500); } }
      &.date-planned, &.date-PLANNED { background: #DBEAFE; .day, .month { color: #1E40AF; } }
      &.date-published, &.date-PUBLISHED { background: #E0E7FF; .day, .month { color: #3730A3; } }
      &.date-completed, &.date-COMPLETED { background: #DCFCE7; .day, .month { color: #166534; } }
      &.date-cancelled, &.date-CANCELLED { background: #FEE2E2; .day, .month { color: #991B1B; } }
    }
    .day { display: block; font-size: 22px; font-weight: 700; }
    .month { font-size: 12px; text-transform: uppercase; font-weight: 600; }
    .event-details { flex: 1; min-width: 0; h4 { margin: 0 0 6px; font-size: 15px; color: var(--gray-900); } }
    .event-meta { display: flex; gap: 16px; flex-wrap: wrap; }
    .meta-item { font-size: 13px; color: var(--gray-500); }
    .event-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .action-btns { display: flex; gap: 4px; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-draft, .badge-DRAFT { background: var(--gray-100); color: var(--gray-600); }
    .badge-planned, .badge-PLANNED { background: #DBEAFE; color: #1E40AF; }
    .badge-published, .badge-PUBLISHED { background: #E0E7FF; color: #3730A3; }
    .badge-completed, .badge-COMPLETED { background: #DCFCE7; color: #166534; }
    .badge-cancelled, .badge-CANCELLED { background: #FEE2E2; color: #991B1B; }
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
    @media (max-width: 1024px) { .calendar-container { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .page-header { flex-direction: column; gap: 12px; align-items: flex-start; } .filters-bar { flex-direction: column; } .form-row { flex-direction: column; } }
  `]
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  filtered: any[] = [];
  entities: any[] = [];
  search = '';
  filterType = '';
  filterStatus = '';
  loading = false;
  showForm = false;
  saving = false;
  editing: any = null;
  deleting: any = null;
  form: any = this.getEmptyForm();

  viewMode = 'calendar';
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  selectedDay: any = null;
  calendarDays: any[] = [];

  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  monthNames = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

  private typeLabels: Record<string, string> = {
    WORSHIP: 'Culte', MEETING: 'Reunion', CONFERENCE: 'Conference', OUTREACH: 'Evangelisation',
    YOUTH: 'Jeunesse', CHARITY: 'Charite', TRAINING: 'Formation', CELEBRATION: 'Celebration', OTHER: 'Autre'
  };
  private statusLabels: Record<string, string> = {
    DRAFT: 'Brouillon', PLANNED: 'Planifie', PUBLISHED: 'Publie', COMPLETED: 'Termine', CANCELLED: 'Annule'
  };
  private eventColors: Record<string, string> = {
    WORSHIP: '#2563EB', MEETING: '#7C3AED', CONFERENCE: '#059669', OUTREACH: '#EA580C',
    YOUTH: '#D946EF', CHARITY: '#E11D48', TRAINING: '#0891B2', CELEBRATION: '#CA8A04', OTHER: '#6B7280'
  };

  constructor(private api: ApiService, private toast: ToastService) {}
  ngOnInit() {
    this.load();
    this.api.getEntities().subscribe({ next: (res: any) => this.entities = res.results || res || [] });
  }

  getEmptyForm() {
    return { title: '', event_type: 'WORSHIP', status: 'DRAFT', start_datetime: '', end_datetime: '', location: '', church: '', expected_budget: null, actual_budget: null, description: '' };
  }

  load() {
    this.loading = true;
    this.api.getEvents().subscribe({
      next: (res: any) => { this.events = res.results || res || []; this.filterList(); this.buildCalendar(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.events.filter(e =>
      (!q || e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)) &&
      (!this.filterType || e.event_type === this.filterType) &&
      (!this.filterStatus || e.status === this.filterStatus)
    );
    this.buildCalendar();
  }

  buildCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;
    const today = new Date();
    this.calendarDays = [];

    const prevMonth = new Date(this.currentYear, this.currentMonth, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonth.getDate() - i;
      this.calendarDays.push({ date: d, otherMonth: true, isToday: false, events: [], fullDate: new Date(this.currentYear, this.currentMonth - 1, d) });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const fullDate = new Date(this.currentYear, this.currentMonth, d);
      const isToday = fullDate.toDateString() === today.toDateString();
      const dayEvents = this.filtered.filter(e => {
        const eDate = new Date(e.start_datetime);
        return eDate.getFullYear() === this.currentYear && eDate.getMonth() === this.currentMonth && eDate.getDate() === d;
      });
      this.calendarDays.push({ date: d, otherMonth: false, isToday, events: dayEvents, fullDate });
    }

    const remaining = 42 - this.calendarDays.length;
    for (let d = 1; d <= remaining; d++) {
      this.calendarDays.push({ date: d, otherMonth: true, isToday: false, events: [], fullDate: new Date(this.currentYear, this.currentMonth + 1, d) });
    }
  }

  prevMonth() { if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear--; } else { this.currentMonth--; } this.buildCalendar(); this.selectedDay = null; }
  nextMonth() { if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++; } else { this.currentMonth++; } this.buildCalendar(); this.selectedDay = null; }
  selectDay(day: any) { if (day.events.length) { this.selectedDay = day; } }

  getEventColor(type: string): string { return this.eventColors[type] || '#6B7280'; }
  typeLabel(t: string): string { return this.typeLabels[t] || t; }
  statusLabel(s: string): string { return this.statusLabels[s] || s; }
  viewEvent(e: any) { this.openForm(e); }

  openForm(event?: any) {
    this.editing = event || null;
    this.form = event ? { ...event, start_datetime: this.toLocalDatetime(event.start_datetime), end_datetime: this.toLocalDatetime(event.end_datetime), expected_budget: event.expected_budget || null, actual_budget: event.actual_budget || null, description: event.description || '' } : this.getEmptyForm();
    this.showForm = true;
  }
  closeForm() { this.showForm = false; this.editing = null; }

  save() {
    this.saving = true;
    const req = this.editing ? this.api.updateEvent(this.editing.id, this.form) : this.api.createEvent(this.form);
    req.subscribe({
      next: () => { this.closeForm(); this.saving = false; this.load(); this.toast.success(this.editing ? 'Evenement modifie' : 'Evenement cree avec succes'); },
      error: (err) => { this.saving = false; this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  confirmDelete(event: any) { this.deleting = event; }
  delete() {
    if (!this.deleting) return;
    this.api.deleteEvent(this.deleting.id).subscribe({
      next: () => { this.deleting = null; this.load(); this.toast.success('Evenement supprime'); },
      error: (err) => { this.toast.error(err.error?.detail || 'Erreur'); }
    });
  }

  private toLocalDatetime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
