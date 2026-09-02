import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MembersComponent } from './features/members/members.component';
import { FamiliesComponent } from './features/families/families.component';
import { ChapelsComponent } from './features/chapels/chapels.component';
import { DepartmentsComponent } from './features/departments/departments.component';
import { EventsComponent } from './features/events/events.component';
import { AttendanceComponent } from './features/attendance/attendance.component';
import { VisitorsComponent } from './features/visitors/visitors.component';
import { FinanceComponent } from './features/finance/finance.component';
import { DonationsComponent } from './features/donations/donations.component';
import { RedistributionComponent } from './features/redistribution/redistribution.component';
import { PastoralComponent } from './features/pastoral/pastoral.component';
import { ReportsComponent } from './features/reports/reports.component';
import { AuditComponent } from './features/audit/audit.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TeamComponent } from './features/team/team.component';
import { RoleAssignmentsComponent } from './features/role-assignments/role-assignments.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'members', component: MembersComponent },
      { path: 'families', component: FamiliesComponent },
      { path: 'chapels', component: ChapelsComponent },
      { path: 'departments', component: DepartmentsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'visitors', component: VisitorsComponent },
      { path: 'finance', component: FinanceComponent },
      { path: 'donations', component: DonationsComponent },
      { path: 'redistribution', component: RedistributionComponent },
      { path: 'pastoral', component: PastoralComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'audit', component: AuditComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'team', component: TeamComponent },
      { path: 'role-assignments', component: RoleAssignmentsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
