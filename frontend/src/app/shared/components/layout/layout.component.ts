import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';
import { routeAnimation } from '../../../core/animations/route.animation';
import { hasRole, ADMIN_ROLES, CAN_VIEW_AUDIT, CAN_VIEW_FINANCE, CAN_VIEW_REPORTS, CAN_MANAGE_DEPARTMENTS, CAN_VIEW_PASTORAL, CAN_VIEW_REDISTRIBUTION, CAN_MANAGE_SETTINGS, CAN_MANAGE_ATTENDANCE } from '../../../core/constants/roles';
import { filter } from 'rxjs';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  animations: [routeAnimation],
  template: `
    <div class="app-layout">
      <app-toast></app-toast>
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h12v16zM12 6l-4 4h2v4h4v-4h2l-4-4z"/></svg>
            </div>
            <span class="brand-name">Cecos Church Management</span>
          </div>
        </div>

        <div class="church-selector">
          <select class="church-select">
            <option>{{ auth.currentUser?.entity_name || 'Ma Paroisse' }}</option>
          </select>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/app/dashboard" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            <span>{{ lang.t('dashboard') }}</span>
          </a>

          <div class="nav-divider"></div>

          <a *ngIf="canViewMembers" routerLink="/app/members" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span>{{ lang.t('members') }}</span>
          </a>

          <a *ngIf="canViewMembers" routerLink="/app/families" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span>{{ lang.t('families') }}</span>
          </a>

          <a routerLink="/app/chapels" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 2L2 7v2h20V7L12 2zm0 2.18L18.18 7H5.82L12 4.18zM4 11v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7H4zm3 2h2v4H7v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4z"/></svg>
            <span>{{ chapelLabel }}</span>
          </a>

          <a *ngIf="canManageTeam" routerLink="/app/team" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span>{{ lang.t('team') }}</span>
          </a>

          <a *ngIf="canManageDepartments" routerLink="/app/departments" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/></svg>
            <span>{{ lang.t('departments') }}</span>
          </a>

          <a *ngIf="canManageDepartments" routerLink="/app/events" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
            <span>{{ lang.t('events') }}</span>
          </a>

          <a *ngIf="canManageAttendance" routerLink="/app/attendance" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            <span>{{ lang.t('attendance') }}</span>
          </a>

          <a *ngIf="canViewMembers" routerLink="/app/visitors" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
            <span>{{ lang.t('visitors') }}</span>
          </a>

          <div class="nav-divider"></div>

          <a *ngIf="canViewFinance" routerLink="/app/finance" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            <span>{{ lang.t('finance') }}</span>
          </a>

          <a *ngIf="canViewFinance" routerLink="/app/donations" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>{{ lang.t('donations') }}</span>
          </a>

          <a *ngIf="canViewRedistribution" routerLink="/app/redistribution" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 18l2-2-2-2v4zM2 6l2 2-2 2V6zm11-4c-4.97 0-9 4.03-9 9 0 2.14.74 4.1 1.97 5.66L12 12V2zm1 10h4l-2-2-2 2z"/></svg>
            <span>{{ lang.t('redistribution') }}</span>
          </a>

          <div class="nav-divider"></div>

          <a *ngIf="canViewPastoral" routerLink="/app/pastoral" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
            <span>{{ lang.t('pastoral') }}</span>
          </a>

          <a *ngIf="canViewReports" routerLink="/app/reports" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            <span>{{ lang.t('reports') }}</span>
          </a>

          <a *ngIf="canViewAudit" routerLink="/app/audit" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            <span>{{ lang.t('audit') }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a *ngIf="canManageSettings" routerLink="/app/settings" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"/></svg>
            <span>{{ lang.t('settings') }}</span>
          </a>
          <a routerLink="/app/settings" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
            <span>{{ lang.t('help') }}</span>
          </a>
          <a class="nav-item logout-btn" (click)="logout()">
            <svg class="nav-icon" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            <span>{{ lang.t('logout') }}</span>
          </a>
        </div>
      </aside>

      <div class="main-area">
        <header class="topbar">
          <div class="topbar-left">
            <nav class="breadcrumb">
              <a routerLink="/app/dashboard">{{ lang.t('dashboard') }}</a>
              <span class="sep">/</span>
              <span class="current">{{ pageTitle }}</span>
            </nav>
          </div>
          <div class="topbar-center">
            <div class="search-bar">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              <input type="text" [placeholder]="lang.t('search')">
            </div>
          </div>
          <div class="topbar-right">
            <button class="icon-btn theme-toggle" (click)="theme.toggle()" [title]="theme.current === 'dark' ? 'Mode clair' : 'Mode sombre'">
              <svg *ngIf="theme.current === 'light'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
              <svg *ngIf="theme.current === 'dark'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
            </button>
            <button class="icon-btn lang-toggle" (click)="lang.toggle()" [title]="lang.current === 'fr' ? 'English' : 'Francais'">
              <span class="lang-label">{{ lang.current === 'fr' ? 'FR' : 'EN' }}</span>
            </button>
            <button class="icon-btn notification-btn" (click)="showNotifications = !showNotifications">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
              <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              <div class="dropdown-menu notifications-menu" *ngIf="showNotifications">
                <div class="dropdown-item notif-item" *ngFor="let n of notifications" [class.unread]="!n.is_read" (click)="markAsRead(n)">
                  <span class="notif-title">{{ n.title || n.message }}</span>
                  <span class="notif-date">{{ n.created_at | date:'short' }}</span>
                </div>
                <div class="dropdown-item" *ngIf="notifications.length === 0">{{ lang.t('no_notifications') }}</div>
              </div>
            </button>
            <div class="user-info" (click)="showUserMenu = !showUserMenu">
              <div class="avatar">{{ userInitials }}</div>
              <div class="user-text">
                <span class="user-name">{{ user?.full_name }}</span>
                <span class="user-role">{{ user?.role | titlecase }} - {{ user?.entity_name }}</span>
              </div>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--gray-400)"><path d="M7 10l5 5 5-5z"/></svg>

              <div class="dropdown-menu" *ngIf="showUserMenu">
                <a class="dropdown-item" routerLink="/app/profile" (click)="showUserMenu = false">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  {{ lang.t('welcome') }}
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item logout" (click)="logout()">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                  {{ lang.t('logout') }}
                </a>
              </div>
            </div>
          </div>
        </header>

        <main class="page-content" [@routeAnimation]="pageTitle">
          <router-outlet></router-outlet>
        </main>

        <footer class="app-footer">
          <span>&copy; 2026 Cecos Church Management &bull; {{ lang.t('welcome_subtitle') }}</span>
          <div class="footer-links">
            <a href="#">{{ lang.t('search') }}</a>
            <a href="#">{{ lang.t('help') }}</a>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }

    .sidebar {
      width: 260px;
      background: var(--white);
      border-right: 1px solid var(--gray-100);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 20px 20px 12px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 38px; height: 38px; background: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .brand-name { font-size: 16px; font-weight: 700; color: var(--gray-900); }

    .church-selector { padding: 0 16px 16px; }
    .church-select {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-sm);
      font-size: 13px;
      color: var(--gray-700);
      background: var(--gray-50);
      cursor: pointer;
      font-family: var(--font-family);
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 10px center;
      background-repeat: no-repeat;
      background-size: 16px;
      padding-right: 32px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 0 12px;
    }

    .nav-divider {
      height: 1px;
      background: var(--gray-100);
      margin: 8px 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 14px;
      border-radius: 8px;
      color: var(--gray-600);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;
      cursor: pointer;
      &:hover {
        background: var(--gray-50);
        color: var(--gray-800);
        text-decoration: none;
      }
      &.active {
        background: var(--primary);
        color: #fff;
        .nav-icon { fill: #fff; }
      }
      .nav-icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
        flex-shrink: 0;
      }
    }

    .logout-btn {
      color: var(--red) !important;
      &:hover { background: var(--red-light) !important; }
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--gray-100);
    }

    .main-area {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 28px;
      background: var(--white);
      border-bottom: 1px solid var(--gray-100);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .topbar-left { display: flex; align-items: center; }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      a { color: var(--gray-400); text-decoration: none; &:hover { color: var(--primary); } }
      .sep { color: var(--gray-300); }
      .current { color: var(--gray-700); font-weight: 600; }
    }

    .topbar-center { flex: 1; max-width: 400px; margin: 0 24px; }

    .search-bar {
      position: relative;
      svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
      input {
        width: 100%;
        padding: 10px 14px 10px 42px;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-sm);
        font-size: 14px;
        background: var(--gray-50);
        font-family: var(--font-family);
        &:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
        &::placeholder { color: var(--gray-400); }
      }
    }

    .topbar-right { display: flex; align-items: center; gap: 8px; }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: var(--gray-500);
      position: relative;
      &:hover { background: var(--gray-50); }
      .badge {
        position: absolute;
        top: 2px;
        right: 2px;
        background: var(--red);
        color: #fff;
        font-size: 10px;
        min-width: 16px;
        height: 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
    }

    .theme-toggle, .lang-toggle {
      font-size: 14px;
      font-weight: 600;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .lang-toggle {
      font-family: var(--font-family);
      letter-spacing: 0.5px;
    }
    .lang-label {
      font-size: 12px;
      font-weight: 700;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      position: relative;
      padding: 4px 8px;
      border-radius: 8px;
      &:hover { background: var(--gray-50); }
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
      flex-shrink: 0;
    }

    .user-text {
      display: flex;
      flex-direction: column;
    }
    .user-name { font-size: 13px; font-weight: 600; color: var(--gray-800); }
    .user-role { font-size: 11px; color: var(--gray-400); }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--white);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      min-width: 200px;
      padding: 6px 0;
      z-index: 200;
      margin-top: 4px;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      color: var(--gray-700);
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
      &:hover { background: var(--gray-50); text-decoration: none; }
      &.logout { color: var(--red); }
    }
    .dropdown-divider { height: 1px; background: var(--gray-100); margin: 4px 0; }

    .notifications-menu { min-width: 280px; max-height: 320px; overflow-y: auto; }
    .notif-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      &.unread { background: var(--gray-50); font-weight: 600; }
      .notif-title { font-size: 13px; color: var(--gray-800); }
      .notif-date { font-size: 11px; color: var(--gray-400); font-weight: 400; }
    }

    .page-content {
      flex: 1;
      padding: 28px;
      background: var(--bg-page);
    }

    .app-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 28px;
      background: var(--white);
      border-top: 1px solid var(--gray-100);
      font-size: 13px;
      color: var(--gray-400);
    }
    .footer-links {
      display: flex;
      gap: 20px;
      a { color: var(--gray-400); &:hover { color: var(--gray-600); } }
    }
  `]
})
export class LayoutComponent implements OnInit {
  showUserMenu = false;
  showNotifications = false;
  pageTitle = '';
  notifications: any[] = [];

  private pageTitles: Record<string, string> = {};

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private router: Router,
    public theme: ThemeService,
    public lang: LanguageService
  ) {
    this.buildPageTitles();
    this.lang.lang$.subscribe(() => this.buildPageTitles());
  }

  private buildPageTitles() {
    this.pageTitles = {
      '/app/dashboard': this.lang.t('dashboard'),
      '/app/members': this.lang.t('members'),
      '/app/families': this.lang.t('families'),
      '/app/chapels': this.lang.t('chapels'),
      '/app/team': this.lang.t('team'),
      '/app/role-assignments': this.lang.t('team'),
      '/app/departments': this.lang.t('departments'),
      '/app/events': this.lang.t('events'),
      '/app/attendance': this.lang.t('attendance'),
      '/app/visitors': this.lang.t('visitors'),
      '/app/finance': this.lang.t('finance'),
      '/app/donations': this.lang.t('donations'),
      '/app/redistribution': this.lang.t('redistribution'),
      '/app/pastoral': this.lang.t('pastoral'),
      '/app/reports': this.lang.t('reports'),
      '/app/audit': this.lang.t('audit'),
      '/app/settings': this.lang.t('settings'),
      '/app/profile': this.lang.t('welcome'),
    };
  }

  get user() { return this.auth.currentUser; }
  get userRole() { return this.user?.role; }
  get isAdmin() { return hasRole(this.userRole, ADMIN_ROLES); }
  get isAdventist() { return this.auth.isAdventist; }
  get canViewAudit() { return hasRole(this.userRole, CAN_VIEW_AUDIT); }
  get canViewFinance() { return hasRole(this.userRole, CAN_VIEW_FINANCE); }
  get canViewReports() { return hasRole(this.userRole, CAN_VIEW_REPORTS); }
  get canManageDepartments() { return hasRole(this.userRole, CAN_MANAGE_DEPARTMENTS); }
  get canViewPastoral() { return hasRole(this.userRole, CAN_VIEW_PASTORAL); }
  get canViewRedistribution() { return this.isAdventist && hasRole(this.userRole, CAN_VIEW_REDISTRIBUTION); }
  get canManageSettings() { return hasRole(this.userRole, CAN_MANAGE_SETTINGS); }
  get canManageAttendance() { return hasRole(this.userRole, CAN_MANAGE_ATTENDANCE); }
  get canViewMembers() { return hasRole(this.userRole, ['LOCAL_LEADER', 'PASTORAL_LEADER']); }
  get canManageTeam() { return hasRole(this.userRole, ['LOCAL_LEADER']); }
  get chapelLabel(): string {
    const d = (this.user as any)?.denomination || this.user?.entity_type || '';
    if (d === 'ADVENTIST') return 'Eglise/Chapelle';
    if (d === 'CATHOLIC') return 'Paroisse/Chapelle';
    return 'Eglise/Chapelle';
  }
  get unreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }
  get userInitials(): string {
    const u = this.user;
    if (!u) return '?';
    return ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase();
  }

  ngOnInit() {
    this.loadNotifications();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      for (const [path, title] of Object.entries(this.pageTitles)) {
        if (url.startsWith(path)) { this.pageTitle = title; return; }
      }
      this.pageTitle = '';
    });
  }

  loadNotifications() {
    this.api.getNotifications().subscribe({
      next: (res) => {
        const list = res?.results ?? res;
        this.notifications = Array.isArray(list) ? list : [];
      },
      error: () => { this.notifications = []; }
    });
  }

  markAsRead(n: any) {
    if (n.is_read) return;
    this.api.markNotificationRead(n.id).subscribe({
      next: () => { n.is_read = true; },
      error: () => {}
    });
  }

  logout() {
    this.showUserMenu = false;
    this.auth.logout();
  }
}
