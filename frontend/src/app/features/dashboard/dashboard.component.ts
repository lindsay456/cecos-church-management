import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { fadeIn } from '../../core/animations/route.animation';
import { BarChartComponent } from '../../shared/components/charts/bar-chart.component';
import { LineChartComponent } from '../../shared/components/charts/line-chart.component';

declare const L: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BarChartComponent, LineChartComponent],
  animations: [fadeIn],
  template: `
    <div class="dashboard" @fadeIn>
      <div class="welcome-section">
        <div class="welcome-text">
          <h1>{{ lang.t('welcome') }}, {{ user?.full_name }}</h1>
          <p>{{ today | date:'EEEE d MMMM yyyy' }} &bull; {{ roleLabel }}</p>
        </div>
        <div class="welcome-right">
          <div class="notif-bell" (click)="showNotifs = !showNotifs">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </div>
          <div class="denom-badge" [ngClass]="'badge-' + denomClass">{{ denomLabel }}</div>
        </div>
      </div>

      <!-- NOTIFICATIONS PANEL -->
      <div class="notif-panel" *ngIf="showNotifs" (click)="$event.stopPropagation()">
        <div class="notif-header">
          <h4>{{ lang.t('notifications') }}</h4>
          <button class="notif-clear" *ngIf="unreadCount > 0" (click)="markAllRead()">{{ lang.t('mark_all_read') }}</button>
        </div>
        <div class="notif-list" *ngIf="notifications.length">
          <div class="notif-item" *ngFor="let n of notifications" [class.unread]="n.status === 'PENDING'" (click)="markRead(n)">
            <div class="notif-dot" [ngClass]="'dot-' + n.notification_type.toLowerCase()"></div>
            <div class="notif-content">
              <strong>{{ n.subject }}</strong>
              <p>{{ n.message }}</p>
              <span class="notif-time">{{ n.created_at | date:'dd/MM HH:mm' }}</span>
            </div>
          </div>
        </div>
        <p class="notif-empty" *ngIf="!notifications.length">{{ lang.t('no_notifications') }}</p>
      </div>

      <!-- LOCAL LEADER DASHBOARD -->
      <ng-container *ngIf="isLocalLeader">
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let stat of stats">
            <div class="stat-content">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
            <div class="stat-icon-wrap" [style.background]="stat.bgColor">
              <svg viewBox="0 0 24 24" width="24" height="24" [attr.fill]="stat.iconColor" [innerHTML]="stat.icon"></svg>
            </div>
          </div>
        </div>

        <!-- CHAPEL MAP SECTION -->
        <div class="card map-card">
          <div class="card-header">
            <h3>{{ lang.t('chapel_map') }}</h3>
          </div>
          <div class="map-search-bar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" [(ngModel)]="chapelSearchQuery" [placeholder]="lang.t('search_chapel')" (ngModelChange)="onChapelSearch()">
            <span class="search-count" *ngIf="chapelSearchQuery">{{ filteredChapels.length }} / {{ allChapels.length }}</span>
          </div>
          <div class="map-container">
            <div id="chapel-map" class="chapel-map"></div>
          </div>
          <div class="map-subtitle" *ngIf="filteredChapels.length && chapelSearchQuery">
            {{ filteredChapels.length }} {{ lang.t('chapels_count').toLowerCase() }} "{{ chapelSearchQuery }}"
          </div>
        </div>

        <div class="content-grid">
          <div class="main-column">
            <div class="card">
              <div class="card-header"><div><h3>{{ lang.t('finance_month') }}</h3></div>
                <div class="header-actions">
                  <button class="export-btn" (click)="exportFinance()">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    PDF
                  </button>
                  <a routerLink="/app/finance" class="link-btn">{{ lang.t('see_all') }}</a>
                </div>
              </div>
              <div class="finance-row">
                <div class="finance-block positive"><span class="finance-label">{{ lang.t('income') }}</span><span class="finance-amount">{{ monthRecettes | number:'1.0-0' }} FCFA</span></div>
                <div class="finance-block negative"><span class="finance-label">{{ lang.t('expenses') }}</span><span class="finance-amount">{{ monthDepenses | number:'1.0-0' }} FCFA</span></div>
              </div>
              <div class="budget-section"><div class="budget-header"><span>{{ lang.t('budget_consumed') }}</span><span>{{ budgetConsumed }}%</span></div><div class="progress-bar"><div class="progress-fill" [style.width.%]="budgetConsumed"></div></div></div>
            </div>

            <div class="card">
              <div class="card-header"><h3>{{ lang.t('income') }} (6 mois)</h3></div>
              <app-bar-chart [data]="chartRevenueData" [labels]="chartRevenueLabels" [colors]="['#2563EB', '#16A34A']"></app-bar-chart>
            </div>
            <div class="card">
              <div class="card-header"><div><h3>{{ lang.t('recent_donations') }}</h3></div><a routerLink="/app/donations" class="link-btn">{{ lang.t('see_all') }}</a></div>
              <div class="donation-stats">
                <div class="donation-block"><span class="donation-label">{{ lang.t('tithes') }}</span><span class="donation-value">{{ monthTithes | number:'1.0-0' }} FCFA</span></div>
                <div class="donation-block"><span class="donation-label">{{ lang.t('offerings') }}</span><span class="donation-value">{{ monthOfferings | number:'1.0-0' }} FCFA</span></div>
              </div>
            </div>
            <div class="card" *ngIf="isAdventist">
              <div class="card-header"><div><h3>{{ lang.t('redistribution') }}</h3></div><a routerLink="/app/redistribution" class="link-btn">{{ lang.t('see_all') }}</a></div>
              <p class="empty-text">{{ lang.t('redistribution_module') }}</p>
            </div>
          </div>
          <div class="side-column">
            <div class="card"><div class="card-header"><h3>{{ lang.t('upcoming_events') }}</h3></div>
              <div class="events-list">
                <div class="event-item" *ngFor="let evt of upcomingEvents">
                  <div class="event-date"><span class="day">{{ evt.start_datetime | date:'dd' }}</span><span class="month">{{ evt.start_datetime | date:'MMM' }}</span></div>
                  <div class="event-info"><div class="event-title">{{ evt.title }}</div><div class="event-meta">{{ evt.start_datetime | date:'HH:mm' }} &bull; {{ evt.location || '' }}</div></div>
                </div>
                <p class="empty-text" *ngIf="upcomingEvents.length === 0">{{ lang.t('no_events') }}</p>
              </div>
              <a routerLink="/app/events" class="view-all">{{ lang.t('see_all') }}</a>
            </div>
            <div class="card alert-card" *ngIf="openPastoral > 0">
              <div class="alert-header"><svg viewBox="0 0 24 24" width="20" height="20" fill="var(--orange)"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><h4>{{ lang.t('pastoral_alert') }}</h4></div>
              <p>{{ openPastoral }} {{ lang.t('cases_pending') }}</p>
              <a routerLink="/app/pastoral" class="link-btn">{{ lang.t('manage') }}</a>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- TREASURER DASHBOARD -->
      <ng-container *ngIf="isTreasurer">
        <div class="stats-grid cols-3">
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('monthly_income') }}</div><div class="stat-value">{{ monthRecettes | number:'1.0-0' }} <small>FCFA</small></div></div><div class="stat-icon-wrap" style="background:#F0FDF4"><svg viewBox="0 0 24 24" width="24" height="24" fill="#16A34A"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div></div>
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('monthly_expenses') }}</div><div class="stat-value">{{ monthDepenses | number:'1.0-0' }} <small>FCFA</small></div></div><div class="stat-icon-wrap" style="background:#FEF2F2"><svg viewBox="0 0 24 24" width="24" height="24" fill="#DC2626"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div></div>
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('tithes_received') }}</div><div class="stat-value">{{ monthTithes | number:'1.0-0' }} <small>FCFA</small></div></div><div class="stat-icon-wrap" style="background:#EFF6FF"><svg viewBox="0 0 24 24" width="24" height="24" fill="#2563EB"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.87c0 1.88-1.43 2.91-3.12 3.17z"/></svg></div></div>
        </div>
        <div class="finance-full">
          <div class="card"><div class="card-header"><h3>{{ lang.t('financial_summary') }}</h3><a routerLink="/app/finance" class="link-btn">{{ lang.t('manage_finance') }}</a></div>
            <div class="finance-row full">
              <div class="finance-block positive"><span class="finance-label">{{ lang.t('income') }}</span><span class="finance-amount">{{ monthRecettes | number:'1.0-0' }} FCFA</span></div>
              <div class="finance-block negative"><span class="finance-label">{{ lang.t('expenses') }}</span><span class="finance-amount">{{ monthDepenses | number:'1.0-0' }} FCFA</span></div>
              <div class="finance-block"><span class="finance-label">{{ lang.t('offerings') }}</span><span class="finance-amount">{{ monthOfferings | number:'1.0-0' }} FCFA</span></div>
            </div>
            <div class="budget-section"><div class="budget-header"><span>{{ lang.t('budget_consumed') }}</span><span>{{ budgetConsumed }}%</span></div><div class="progress-bar"><div class="progress-fill" [style.width.%]="budgetConsumed"></div></div></div>
          </div>
          <div class="card"><div class="card-header"><h3>{{ lang.t('donations') }}</h3><a routerLink="/app/donations" class="link-btn">{{ lang.t('see_all') }}</a></div>
            <div class="donation-stats">
              <div class="donation-block"><span class="donation-label">{{ lang.t('tithes') }}</span><span class="donation-value">{{ monthTithes | number:'1.0-0' }} FCFA</span></div>
              <div class="donation-block"><span class="donation-label">{{ lang.t('offerings') }}</span><span class="donation-value">{{ monthOfferings | number:'1.0-0' }} FCFA</span></div>
            </div>
          </div>
          <div class="card" *ngIf="isAdventist"><div class="card-header"><h3>{{ lang.t('redistribution') }}</h3><a routerLink="/app/redistribution" class="link-btn">{{ lang.t('see_all') }}</a></div><p class="empty-text">{{ lang.t('redistribution_module') }}</p></div>
          <div class="card"><div class="card-header"><h3>{{ lang.t('reports') }}</h3><a routerLink="/app/reports" class="link-btn">{{ lang.t('download_reports') }}</a></div><p class="empty-text">{{ lang.t('generate_reports') }}</p></div>
        </div>
      </ng-container>

      <!-- DEPARTMENT LEADER DASHBOARD -->
      <ng-container *ngIf="isDeptLeader">
        <div class="stats-grid cols-2">
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('departments') }}</div><div class="stat-value">{{ deptCount }}</div></div><div class="stat-icon-wrap" style="background:#ECFDF5"><svg viewBox="0 0 24 24" width="24" height="24" fill="#059669"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/></svg></div></div>
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('upcoming_events') }}</div><div class="stat-value">{{ upcomingEvents.length }}</div></div><div class="stat-icon-wrap" style="background:#FEF3C7"><svg viewBox="0 0 24 24" width="24" height="24" fill="#D97706"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg></div></div>
        </div>
        <div class="content-grid">
          <div class="main-column">
            <div class="card"><div class="card-header"><h3>{{ lang.t('my_departments') }}</h3><a routerLink="/app/departements" class="link-btn">{{ lang.t('see_all') }}</a></div>
              <p class="empty-text">{{ lang.t('manage_departments') }}</p>
            </div>
            <div class="card"><div class="card-header"><h3>{{ lang.t('events') }}</h3><a routerLink="/app/events" class="link-btn">{{ lang.t('see_all') }}</a></div>
              <div class="events-list">
                <div class="event-item" *ngFor="let evt of upcomingEvents.slice(0,5)">
                  <div class="event-date"><span class="day">{{ evt.start_datetime | date:'dd' }}</span><span class="month">{{ evt.start_datetime | date:'MMM' }}</span></div>
                  <div class="event-info"><div class="event-title">{{ evt.title }}</div><div class="event-meta">{{ evt.start_datetime | date:'HH:mm' }} &bull; {{ evt.location || '' }}</div></div>
                </div>
                <p class="empty-text" *ngIf="upcomingEvents.length === 0">{{ lang.t('no_events') }}</p>
              </div>
            </div>
          </div>
          <div class="side-column">
            <div class="card"><div class="card-header"><h3>{{ lang.t('upcoming_events') }}</h3></div>
              <div class="events-list">
                <div class="event-item" *ngFor="let evt of upcomingEvents.slice(0,4)">
                  <div class="event-date"><span class="day">{{ evt.start_datetime | date:'dd' }}</span><span class="month">{{ evt.start_datetime | date:'MMM' }}</span></div>
                  <div class="event-info"><div class="event-title">{{ evt.title }}</div><div class="event-meta">{{ evt.start_datetime | date:'HH:mm' }}</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- CHAPEL LEADER DASHBOARD -->
      <ng-container *ngIf="isChapelLeader">
        <div class="stats-grid cols-3">
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('last_worship') }}</div><div class="stat-value">{{ lastWorship }}</div></div><div class="stat-icon-wrap" style="background:#FEF3C7"><svg viewBox="0 0 24 24" width="24" height="24" fill="#D97706"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></div></div>
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('visitors_count') }}</div><div class="stat-value">{{ visitors }}</div></div><div class="stat-icon-wrap" style="background:#FFF7ED"><svg viewBox="0 0 24 24" width="24" height="24" fill="#EA580C"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg></div></div>
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('chapels') }}</div><div class="stat-value">{{ chapels }}</div></div><div class="stat-icon-wrap" style="background:#FDF4FF"><svg viewBox="0 0 24 24" width="24" height="24" fill="#9333EA"><path d="M12 2L2 7v2h20V7L12 2zm0 2.18L18.18 7H5.82L12 4.18zM4 11v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7H4z"/></svg></div></div>
        </div>
        <div class="content-grid">
          <div class="main-column">
            <div class="card"><div class="card-header"><h3>{{ lang.t('attendance') }} - {{ lang.t('last_worship') }}</h3>
                <div class="header-actions">
                  <button class="export-btn" (click)="exportAttendance()">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    PDF
                  </button>
                  <a routerLink="/app/attendance" class="link-btn">{{ lang.t('see_all') }}</a>
                </div>
              </div>
              <div class="table-container" *ngIf="chapelAttendance.length">
                <table><thead><tr><th>{{ lang.t('date') }}</th><th>{{ lang.t('type') }}</th><th>{{ lang.t('chapel') }}</th><th>{{ lang.t('men') }}</th><th>{{ lang.t('women') }}</th><th>{{ lang.t('children') }}</th><th>{{ lang.t('visitors_short') }}</th><th>{{ lang.t('total') }}</th></tr></thead>
                <tbody><tr *ngFor="let s of chapelAttendance">
                  <td>{{ s.date | date:'dd/MM/yyyy' }}</td><td>{{ s.service_type }}</td><td>{{ s.chapel_name }}</td>
                  <td>{{ s.men_count }}</td><td>{{ s.women_count }}</td><td>{{ s.children_count }}</td><td>{{ s.visitors_count }}</td>
                  <td><strong>{{ s.total }}</strong></td>
                </tr></tbody></table>
              </div>
              <p class="empty-text" *ngIf="!chapelAttendance.length">{{ lang.t('no_attendance') }}</p>
            </div>

            <div class="card">
              <div class="card-header"><h3>{{ lang.t('attendance') }} (8 semaines)</h3></div>
              <app-line-chart [series]="chartAttendanceData" [labels]="chartAttendanceLabels" [colors]="['#2563EB', '#EA580C']"></app-line-chart>
            </div>
          </div>
          <div class="side-column">
            <div class="card"><div class="card-header"><h3>{{ lang.t('record_attendance') }}</h3></div>
              <a routerLink="/app/attendance" class="view-all">{{ lang.t('take_attendance') }}</a>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- PASTORAL LEADER DASHBOARD -->
      <ng-container *ngIf="isPastoralLeader">
        <div class="stats-grid cols-3">
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('open_followups') }}</div><div class="stat-value">{{ openPastoral }}</div></div><div class="stat-icon-wrap" style="background:#FEF3C7"><svg viewBox="0 0 24 24" width="24" height="24" fill="#D97706"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div></div>
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('active_members_count') }}</div><div class="stat-value">{{ memberCount }}</div></div><div class="stat-icon-wrap" style="background:#EFF6FF"><svg viewBox="0 0 24 24" width="24" height="24" fill="#2563EB"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div></div>
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('families_count') }}</div><div class="stat-value">{{ familyCount }}</div></div><div class="stat-icon-wrap" style="background:#F0FDF4"><svg viewBox="0 0 24 24" width="24" height="24" fill="#16A34A"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div></div>
        </div>
        <div class="content-grid">
          <div class="main-column">
            <div class="card"><div class="card-header"><h3>{{ lang.t('pastoral') }}</h3><a routerLink="/app/pastoral" class="link-btn">{{ lang.t('see_all') }}</a></div>
              <p class="empty-text">{{ lang.t('manage') }}</p>
            </div>
          </div>
          <div class="side-column">
            <div class="card alert-card" *ngIf="openPastoral > 0">
              <div class="alert-header"><svg viewBox="0 0 24 24" width="20" height="20" fill="var(--orange)"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg><h4>{{ lang.t('attention') }}</h4></div>
              <p>{{ openPastoral }} {{ lang.t('cases_waiting') }}</p>
              <a routerLink="/app/pastoral" class="link-btn">{{ lang.t('manage') }}</a>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- AUDITOR DASHBOARD -->
      <ng-container *ngIf="isAuditor">
        <div class="stats-grid cols-2">
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('audit_log') }}</div><div class="stat-value">{{ lang.t('audit') }}</div></div><div class="stat-icon-wrap" style="background:#EFF6FF"><svg viewBox="0 0 24 24" width="24" height="24" fill="#2563EB"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></div></div>
          <div class="stat-card"><div class="stat-content"><div class="stat-label">{{ lang.t('reports') }}</div><div class="stat-value">{{ lang.t('download_reports') }}</div></div><div class="stat-icon-wrap" style="background:#F0FDF4"><svg viewBox="0 0 24 24" width="24" height="24" fill="#16A34A"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg></div></div>
        </div>
        <div class="content-grid">
          <div class="main-column">
            <div class="card"><div class="card-header"><h3>{{ lang.t('audit_log') }}</h3><a routerLink="/app/audit" class="link-btn">{{ lang.t('see_all') }}</a></div>
              <p class="empty-text">{{ lang.t('audit_consult') }}</p>
            </div>
          </div>
          <div class="side-column">
            <div class="card"><div class="card-header"><h3>{{ lang.t('reports') }}</h3><a routerLink="/app/reports" class="link-btn">{{ lang.t('generate_reports') }}</a></div>
              <p class="empty-text">{{ lang.t('download_reports') }}</p>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- MEMBER DASHBOARD -->
      <ng-container *ngIf="isMember">
        <div class="card" style="text-align:center; padding:60px 20px;">
          <h3>{{ lang.t('welcome') }}, {{ user?.full_name }}</h3>
          <p style="color:var(--gray-500); margin-top:8px;">{{ lang.t('welcome_subtitle') }}</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; position: relative; }
    .welcome-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;
      h1 { font-size: 26px; font-weight: 800; color: var(--gray-900); margin-bottom: 4px; }
      p { font-size: 14px; color: var(--gray-500); margin: 0; }
    }
    .welcome-right { display: flex; align-items: center; gap: 16px; }
    .notif-bell { position: relative; cursor: pointer; padding: 8px; border-radius: 10px; background: var(--white); border: 1px solid var(--gray-200); color: var(--gray-600); &:hover { background: var(--gray-50); } }
    .notif-badge { position: absolute; top: 2px; right: 2px; background: var(--red); color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .denom-badge { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .badge-CATHOLIC { background: #FEF3C7; color: #92400E; }
    .badge-PROTESTANT { background: #D1FAE5; color: #065F46; }
    .badge-ADVENTIST { background: #DBEAFE; color: #1E40AF; }

    .notif-panel { position: absolute; top: 70px; right: 0; width: 360px; background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow-lg); border: 1px solid var(--gray-100); z-index: 100; max-height: 400px; overflow-y: auto; }
    .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--gray-100); h4 { margin: 0; font-size: 15px; } }
    .notif-clear { background: none; border: none; font-size: 12px; color: var(--primary); cursor: pointer; font-family: var(--font-family); }
    .notif-list { padding: 8px 0; }
    .notif-item { display: flex; gap: 12px; padding: 12px 20px; cursor: pointer; transition: background 0.1s; &:hover { background: var(--gray-50); } &.unread { background: rgba(37,99,235,0.03); } }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .dot-receipt, .dot-donation_validated { background: #16A34A; }
    .dot-donation_cancelled, .dot-security_alert { background: #DC2626; }
    .dot-event_reminder, .dot-event_updated { background: #2563EB; }
    .dot-budget_alert { background: #D97706; }
    .dot-transfer_request, .dot-transfer_approved { background: #7C3AED; }
    .dot-other { background: #6B7280; }
    .notif-content { flex: 1; min-width: 0; strong { font-size: 13px; color: var(--gray-900); display: block; } p { font-size: 12px; color: var(--gray-500); margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } }
    .notif-time { font-size: 11px; color: var(--gray-400); }
    .notif-empty { text-align: center; padding: 24px; font-size: 14px; color: var(--gray-400); }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stats-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
    .stats-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
    .stat-card { background: var(--white); border-radius: var(--radius); padding: 20px; display: flex; justify-content: space-between; align-items: flex-start; border: 1px solid var(--gray-100); box-shadow: var(--shadow-sm); transition: transform 0.2s ease, box-shadow 0.2s ease;
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    }
    .stat-label { font-size: 13px; color: var(--gray-500); margin-bottom: 6px; }
    .stat-value { font-size: 26px; font-weight: 800; color: var(--gray-900); small { font-size: 14px; font-weight: 600; } }
    .stat-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .content-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
    .main-column, .side-column { display: flex; flex-direction: column; gap: 20px; }
    .finance-full { display: flex; flex-direction: column; gap: 20px; }

    .card { background: var(--white); border-radius: var(--radius); padding: 24px; border: 1px solid var(--gray-100); box-shadow: var(--shadow-sm); transition: transform 0.2s ease, box-shadow 0.2s ease;
      &:hover { box-shadow: var(--shadow-md); }
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h3 { font-size: 16px; font-weight: 700; margin: 0; } }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .link-btn { font-size: 13px; font-weight: 600; color: var(--primary); text-decoration: none; transition: color 0.15s; &:hover { text-decoration: underline; } }
    .export-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--white); background: var(--primary); border: none; cursor: pointer; font-family: var(--font-family); transition: background 0.15s, transform 0.1s;
      &:hover { background: var(--primary-hover); }
      &:active { transform: scale(0.97); }
    }

    .finance-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; &.full { grid-template-columns: 1fr 1fr 1fr; } }
    .finance-block { padding: 16px; border-radius: 10px; &.positive { background: var(--green-light); } &.negative { background: var(--red-light); } }
    .finance-label { display: block; font-size: 13px; color: var(--gray-500); margin-bottom: 4px; }
    .finance-amount { font-size: 18px; font-weight: 700; }
    .positive .finance-amount { color: var(--green); }
    .negative .finance-amount { color: var(--red); }

    .budget-section { .budget-header { display: flex; justify-content: space-between; font-size: 13px; color: var(--gray-600); margin-bottom: 8px; } }
    .progress-bar { height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.5s ease; }

    .donation-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .donation-block { .donation-label { display: block; font-size: 12px; color: var(--gray-400); margin-bottom: 4px; } .donation-value { font-size: 16px; font-weight: 700; color: var(--gray-800); } }

    .events-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .event-item { display: flex; gap: 14px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--gray-50); transition: background 0.15s; &:last-child { border: none; } &:hover { background: var(--gray-50); margin: 0 -8px; padding: 8px; border-radius: 6px; } }
    .event-date { background: var(--primary-light); border-radius: 8px; padding: 8px 12px; text-align: center; min-width: 52px; }
    .day { display: block; font-size: 18px; font-weight: 800; color: var(--primary); }
    .month { font-size: 11px; color: var(--primary); text-transform: uppercase; font-weight: 600; }
    .event-title { font-size: 14px; font-weight: 600; color: var(--gray-800); }
    .event-meta { font-size: 12px; color: var(--gray-400); }
    .view-all { display: block; text-align: center; font-size: 13px; font-weight: 600; color: var(--primary); text-decoration: none; padding-top: 12px; border-top: 1px solid var(--gray-100); &:hover { text-decoration: underline; } }

    .alert-card { background: var(--orange-light); border-color: #fed7aa; }
    .alert-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; h4 { margin: 0; font-size: 14px; color: var(--orange); } }
    .alert-card p { font-size: 13px; color: var(--gray-600); margin: 0 0 12px; }

    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--gray-50); padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: var(--gray-500); text-transform: uppercase; }
    td { padding: 10px 12px; border-top: 1px solid var(--gray-100); font-size: 14px; }

    .empty-text { font-size: 14px; color: var(--gray-400); text-align: center; padding: 20px 0; margin: 0; }

    .map-card { margin-bottom: 24px; }
    .map-search-bar {
      display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px;
      background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
      svg { color: var(--gray-400); flex-shrink: 0; }
      input {
        flex: 1; border: none; background: transparent; font-size: 14px; font-family: var(--font-family);
        color: var(--gray-700); outline: none;
        &::placeholder { color: var(--gray-400); }
      }
      .search-count { font-size: 12px; color: var(--gray-400); white-space: nowrap; }
    }
    .map-container { border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--gray-200); }
    .chapel-map { width: 100%; height: 400px; }
    .map-subtitle { font-size: 13px; color: var(--gray-500); text-align: center; margin-top: 12px; }

    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr 1fr; } .welcome-section { flex-direction: column; gap: 12px; align-items: flex-start; } .chapel-map { height: 300px; } }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  today = new Date();
  openPastoral = 0;
  monthRecettes = 0;
  monthDepenses = 0;
  budgetConsumed = 0;
  monthTithes = 0;
  monthOfferings = 0;
  upcomingEvents: any[] = [];
  memberCount = 0;
  familyCount = 0;
  chapels = 0;
  lastWorship = 0;
  visitors = 0;
  deptCount = 0;
  chapelAttendance: any[] = [];
  notifications: any[] = [];
  unreadCount = 0;
  showNotifs = false;

  map: any = null;
  mapReady = false;
  private mapInitialized = false;
  chapelSearchQuery = '';
  chapelMarkers: any[] = [];
  filteredChapels: any[] = [];
  allChapels: any[] = [];

  chartRevenueData: number[] = [];
  chartRevenueLabels: string[] = [];
  chartAttendanceData: { name: string; data: number[] }[] = [];
  chartAttendanceLabels: string[] = [];

  stats = [
    { labelKey: 'active_members', label: 'Membres actifs', value: '0', bgColor: '#EFF6FF', iconColor: '#2563EB', icon: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>' },
    { labelKey: 'families_count', label: 'Familles', value: '0', bgColor: '#F0FDF4', iconColor: '#16A34A', icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' },
    { labelKey: 'chapels_count', label: 'Chapelles', value: '0', bgColor: '#FDF4FF', iconColor: '#9333EA', icon: '<path d="M12 2L2 7v2h20V7L12 2zm0 2.18L18.18 7H5.82L12 4.18zM4 11v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7H4z"/>' },
    { labelKey: 'last_worship', label: 'Dernier culte', value: '0', bgColor: '#FEF3C7', iconColor: '#D97706', icon: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>' },
    { labelKey: 'visitors_count', label: 'Visiteurs', value: '0', bgColor: '#FFF7ED', iconColor: '#EA580C', icon: '<path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>' },
    { labelKey: 'departments_count', label: 'Departements', value: '0', bgColor: '#ECFDF5', iconColor: '#059669', icon: '<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>' },
  ];

  constructor(public auth: AuthService, private api: ApiService, private toast: ToastService, public lang: LanguageService, public theme: ThemeService, private pdf: PdfExportService) {}

  get user() { return this.auth.currentUser; }
  get isLocalLeader() { return this.auth.isLocalLeader; }
  get isTreasurer() { return this.auth.isTreasurer; }
  get isDeptLeader() { return this.auth.isDeptLeader; }
  get isPastoralLeader() { return this.auth.isPastoralLeader; }
  get isChapelLeader() { return this.auth.isChapelLeader; }
  get isAuditor() { return this.auth.isAuditor; }
  get isMember() { return this.auth.isMember; }
  get isAdventist() { return this.auth.isAdventist; }

  get roleLabel(): string {
    const labels: Record<string, string> = {
      LOCAL_LEADER: this.lang.t('team'), TREASURER: this.lang.t('finance'), DEPARTMENT_LEADER: this.lang.t('departments'),
      PASTORAL_LEADER: this.lang.t('pastoral'), CHAPEL_LEADER: this.lang.t('chapels'), AUDITOR: this.lang.t('audit'), MEMBER: this.lang.t('members')
    };
    return labels[this.auth.userRole] || this.auth.userRole;
  }
  get denomLabel(): string {
    const d = this.auth.denomination;
    const labels: Record<string, string> = { CATHOLIC: 'Catholique', PROTESTANT: 'Protestant', ADVENTIST: 'Adventiste' };
    return labels[d] || d;
  }
  get denomClass(): string { return this.auth.denomination; }

  ngOnInit() {
    this.loadStats();
    this.loadEvents();
    this.loadNotifications();
    this.loadChartData();
    document.addEventListener('click', this.closeNotifs);
  }

  ngAfterViewInit() { setTimeout(() => this.initMap(), 100); }

  ngOnDestroy() {
    if (this.map) { this.map.remove(); this.map = null; }
    document.removeEventListener('click', this.closeNotifs);
  }

  private closeNotifs = () => { this.showNotifs = false; }

  initMap() {
    if (this.mapInitialized) return;
    this.mapInitialized = true;
    const mapEl = document.getElementById('chapel-map');
    if (!mapEl || typeof L === 'undefined') { setTimeout(() => this.initMap(), 300); return; }
    this.map = L.map('chapel-map', { zoomControl: true, scrollWheelZoom: false }).setView([4.39635, 11.46914], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(this.map);
    this.mapReady = true;
    this.loadChapels();
    setTimeout(() => this.map.invalidateSize(), 200);
  }

  loadChapels() {
    this.api.getChapels().subscribe({
      next: (res: any) => {
        const chapels = res.results || res || [];
        this.allChapels = chapels;
        this.filteredChapels = chapels;
        if (!this.map) return;
        this.renderChapelMarkers(chapels);
      },
      error: (err) => {
        console.error('Failed to load chapels:', err);
      }
    });
  }

  renderChapelMarkers(chapels: any[]) {
    if (!this.map) return;
    this.chapelMarkers.forEach(m => m.remove());
    this.chapelMarkers = [];
    let centerSet = false;
    chapels.forEach((c: any) => {
      const lat = c.gps_lat || c.latitude || c.lat;
      const lng = c.gps_lng || c.longitude || c.lng || c.lon;
      if (lat && lng) {
        const marker = L.marker([parseFloat(lat), parseFloat(lng)]).addTo(this.map)
          .bindPopup(`<strong>${c.name}</strong><br>${c.address || ''}`);
        this.chapelMarkers.push(marker);
        if (!centerSet) { this.map.setView([parseFloat(lat), parseFloat(lng)], 10); centerSet = true; }
      }
    });
    if (this.chapelMarkers.length > 1) {
      const group = L.featureGroup(this.chapelMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  onChapelSearch() {
    const q = this.chapelSearchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredChapels = this.allChapels;
    } else {
      this.filteredChapels = this.allChapels.filter((c: any) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.neighborhood || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q)
      );
    }
    this.renderChapelMarkers(this.filteredChapels);
  }

  loadStats() {
    this.stats[0].label = this.lang.t('active_members');
    this.stats[1].label = this.lang.t('families_count');
    this.stats[2].label = this.lang.t('chapels_count');
    this.stats[3].label = this.lang.t('last_worship');
    this.stats[4].label = this.lang.t('visitors_count');
    this.stats[5].label = this.lang.t('departments_count');

    this.api.getDashboardStats().subscribe({
      next: (data: any) => {
        this.monthRecettes = data.month_recettes || 0;
        this.monthDepenses = data.month_depenses || 0;
        this.budgetConsumed = data.budget_consumed || 0;
        this.monthTithes = data.month_tithes || 0;
        this.monthOfferings = data.month_offerings || 0;
        this.openPastoral = data.open_pastoral || 0;
        this.memberCount = data.active_members || 0;
        this.familyCount = data.families || 0;
        this.chapels = data.chapels || 0;
        this.lastWorship = data.last_worship_count || 0;
        this.visitors = data.visitors || 0;
        this.deptCount = data.departments || 0;
        this.chapelAttendance = data.chapel_attendance || [];
        this.unreadCount = data.notifications_unread || 0;
        this.stats[0].value = (data.active_members || 0).toLocaleString('fr-FR');
        this.stats[1].value = (data.families || 0).toLocaleString('fr-FR');
        this.stats[2].value = (data.chapels || 0).toLocaleString('fr-FR');
        this.stats[3].value = (data.last_worship_count || 0).toLocaleString('fr-FR');
        this.stats[4].value = (data.visitors || 0).toLocaleString('fr-FR');
        this.stats[5].value = (data.departments || 0).toLocaleString('fr-FR');
      }
    });
  }

  loadEvents() {
    this.api.getEvents({ limit: 6 }).subscribe({
      next: (data: any) => { this.upcomingEvents = Array.isArray(data) ? data.slice(0, 6) : (data.results || []).slice(0, 6); }
    });
  }

  loadNotifications() {
    this.api.getNotifications({ status: 'PENDING', limit: 10 }).subscribe({
      next: (data: any) => { this.notifications = (data.results || data || []).slice(0, 10); }
    });
  }

  markRead(notif: any) {
    this.api.markNotificationRead(notif.id).subscribe({
      next: () => { notif.status = 'READ'; this.unreadCount = Math.max(0, this.unreadCount - 1); }
    });
  }

  markAllRead() {
    this.api.markAllNotificationsRead().subscribe({
      next: () => { this.notifications.forEach(n => n.status = 'READ'); this.unreadCount = 0; this.toast.success('Notifications marquees comme lues'); }
    });
  }

  loadChartData() {
    this.api.getDashboardStats().subscribe({
      next: (data: any) => {
        const chart = data.chart || {};
        this.chartRevenueLabels = chart.revenue_labels || [];
        this.chartRevenueData = chart.revenue_income || [];
        this.chartAttendanceLabels = chart.attendance_labels || [];
        this.chartAttendanceData = [
          { name: this.lang.t('men'), data: chart.attendance_total || [] },
        ];
      }
    });
  }

  exportFinance() {
    this.pdf.exportFinanceToPdf({
      income: this.monthRecettes,
      expenses: this.monthDepenses,
      tithes: this.monthTithes,
      offerings: this.monthOfferings,
      budget: this.budgetConsumed,
    });
  }

  exportAttendance() {
    const rows = this.chapelAttendance.map(s => [
      new Date(s.date).toLocaleDateString('fr-FR'),
      s.service_type,
      s.chapel_name,
      s.men_count,
      s.women_count,
      s.children_count,
      s.visitors_count,
      s.total,
    ]);
    this.pdf.exportAttendanceToPdf(rows);
  }
}
