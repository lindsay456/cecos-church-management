import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Church, Chapel, Member, Family, Department, Event,
  WorshipSession, Recette, Depense, Don, Redistribution,
  Notification, AuditLog, DashboardStats, Visitor
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getToken(): string {
    return localStorage.getItem('access_token') || '';
  }

  openPdfInTab(url: string, filename: string): void {
    const newTab = window.open('', '_blank');
    if (!newTab) {
      alert('Autorisez les popups puis reessayez');
      return;
    }
    fetch(url, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    }).then(res => {
      if (!res.ok) throw new Error('Erreur');
      return res.blob();
    }).then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      newTab.location.href = blobUrl;
    }).catch(() => {
      newTab.close();
      alert('Erreur lors de l\'ouverture du fichier');
    });
  }

  // Churches
  getChurches(params?: any): Observable<any> { return this.http.get(`${this.base}/churches/`, { params }); }
  getChurch(id: number): Observable<Church> { return this.http.get<Church>(`${this.base}/churches/${id}/`); }

  // Chapels
  getChapels(params?: any): Observable<any> { return this.http.get(`${this.base}/chapels/`, { params }); }
  getChapel(id: number): Observable<Chapel> { return this.http.get<Chapel>(`${this.base}/chapels/${id}/`); }
  createChapel(data: any): Observable<Chapel> { return this.http.post<Chapel>(`${this.base}/chapels/`, data); }
  updateChapel(id: number, data: any): Observable<Chapel> { return this.http.put<Chapel>(`${this.base}/chapels/${id}/`, data); }
  deleteChapel(id: number): Observable<any> { return this.http.delete(`${this.base}/chapels/${id}/`); }

  // Members
  getMembers(params?: any): Observable<any> { return this.http.get(`${this.base}/members/`, { params }); }
  getMember(id: number): Observable<Member> { return this.http.get<Member>(`${this.base}/members/${id}/`); }
  createMember(data: any): Observable<Member> { return this.http.post<Member>(`${this.base}/members/`, data); }
  updateMember(id: number, data: any): Observable<Member> { return this.http.put<Member>(`${this.base}/members/${id}/`, data); }
  archiveMember(id: number): Observable<any> { return this.http.post(`${this.base}/members/${id}/archive/`, {}); }
  transferMember(id: number, data: any): Observable<any> { return this.http.post(`${this.base}/members/${id}/transfer/`, data); }
  getMemberDonations(memberId: number): Observable<any> { return this.http.get(`${this.base}/members/${memberId}/donations/`); }
  getMemberDepartments(memberId: number): Observable<any> { return this.http.get(`${this.base}/members/${memberId}/departments/`); }
  getMemberReceipts(memberId: number): Observable<any> { return this.http.get(`${this.base}/members/${memberId}/receipts/`); }
  getMemberTransfers(memberId: number): Observable<any> { return this.http.get(`${this.base}/members/${memberId}/transfers/`); }

  // Visitors
  getVisitors(params?: any): Observable<any> { return this.http.get(`${this.base}/visitors/`, { params }); }
  getVisitor(id: number): Observable<any> { return this.http.get(`${this.base}/visitors/${id}/`); }
  createVisitor(data: any): Observable<Visitor> { return this.http.post<Visitor>(`${this.base}/visitors/`, data); }
  updateVisitor(id: number, data: any): Observable<any> { return this.http.patch(`${this.base}/visitors/${id}/`, data); }
  deleteVisitor(id: number): Observable<any> { return this.http.delete(`${this.base}/visitors/${id}/`); }

  // Families
  getFamilies(params?: any): Observable<any> { return this.http.get(`${this.base}/families/`, { params }); }
  getFamily(id: number): Observable<Family> { return this.http.get<Family>(`${this.base}/families/${id}/`); }
  createFamily(data: any): Observable<Family> { return this.http.post<Family>(`${this.base}/families/`, data); }
  updateFamily(id: number, data: any): Observable<Family> { return this.http.put<Family>(`${this.base}/families/${id}/`, data); }
  deleteFamily(id: number): Observable<any> { return this.http.delete(`${this.base}/families/${id}/`); }

  // Departments
  getDepartments(params?: any): Observable<any> { return this.http.get(`${this.base}/departments/`, { params }); }
  getDepartment(id: number): Observable<any> { return this.http.get(`${this.base}/departments/${id}/`); }
  createDepartment(data: any): Observable<any> { return this.http.post(`${this.base}/departments/`, data); }
  updateDepartment(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/departments/${id}/`, data); }
  deleteDepartment(id: number): Observable<any> { return this.http.delete(`${this.base}/departments/${id}/`); }

  // Annual Plans
  getAnnualPlans(params?: any): Observable<any> { return this.http.get(`${this.base}/annual-plans/`, { params }); }
  createAnnualPlan(data: any): Observable<any> { return this.http.post(`${this.base}/annual-plans/`, data); }
  updateAnnualPlan(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/annual-plans/${id}/`, data); }
  deleteAnnualPlan(id: number): Observable<any> { return this.http.delete(`${this.base}/annual-plans/${id}/`); }

  // Events
  getEvents(params?: any): Observable<any> { return this.http.get(`${this.base}/events/`, { params }); }
  getEvent(id: number): Observable<Event> { return this.http.get<Event>(`${this.base}/events/${id}/`); }
  createEvent(data: any): Observable<Event> { return this.http.post<Event>(`${this.base}/events/`, data); }
  updateEvent(id: number, data: any): Observable<Event> { return this.http.put<Event>(`${this.base}/events/${id}/`, data); }
  deleteEvent(id: number): Observable<any> { return this.http.delete(`${this.base}/events/${id}/`); }

  // Worship Sessions
  getWorshipSessions(params?: any): Observable<any> { return this.http.get(`${this.base}/worship-sessions/`, { params }); }
  createWorshipSession(data: any): Observable<WorshipSession> { return this.http.post<WorshipSession>(`${this.base}/worship-sessions/`, data); }

  // Finance
  getRecettes(params?: any): Observable<any> { return this.http.get(`${this.base}/recettes/`, { params }); }
  createRecette(data: any): Observable<Recette> { return this.http.post<Recette>(`${this.base}/recettes/`, data); }
  updateRecette(id: number, data: any): Observable<Recette> { return this.http.put<Recette>(`${this.base}/recettes/${id}/`, data); }
  deleteRecette(id: number): Observable<any> { return this.http.delete(`${this.base}/recettes/${id}/`); }
  getDepenses(params?: any): Observable<any> { return this.http.get(`${this.base}/depenses/`, { params }); }
  createDepense(data: any): Observable<Depense> { return this.http.post<Depense>(`${this.base}/depenses/`, data); }
  updateDepense(id: number, data: any): Observable<Depense> { return this.http.put<Depense>(`${this.base}/depenses/${id}/`, data); }
  deleteDepense(id: number): Observable<any> { return this.http.delete(`${this.base}/depenses/${id}/`); }
  getBudgets(params?: any): Observable<any> { return this.http.get(`${this.base}/budgets/`, { params }); }
  getFinancialCategories(): Observable<any> { return this.http.get(`${this.base}/financial-categories/`); }

  // Donations
  getDonations(params?: any): Observable<any> { return this.http.get(`${this.base}/donations/`, { params }); }
  getDonation(id: number): Observable<Don> { return this.http.get<Don>(`${this.base}/donations/${id}/`); }
  createDonation(data: any): Observable<Don> { return this.http.post<Don>(`${this.base}/donations/`, data); }
  updateDonation(id: number, data: any): Observable<Don> { return this.http.put<Don>(`${this.base}/donations/${id}/`, data); }
  deleteDonation(id: number): Observable<any> { return this.http.delete(`${this.base}/donations/${id}/`); }
  validateDonation(id: number): Observable<any> { return this.http.post(`${this.base}/donations/${id}/validate_don/`, {}); }
  rejectDonation(id: number, reason: string): Observable<any> { return this.http.post(`${this.base}/donations/${id}/reject/`, { reason }); }
  cancelDonation(id: number, reason: string): Observable<any> { return this.http.post(`${this.base}/donations/${id}/cancel/`, { reason }); }
  getDonationReceipt(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/donations/${id}/receipt/`, { responseType: 'blob' });
  }
  getReceipts(params?: any): Observable<any> { return this.http.get(`${this.base}/receipts/`, { params }); }
  downloadReceipt(receiptId: number): Observable<Blob> {
    return this.http.get(`${this.base}/receipts/${receiptId}/download/`, { responseType: 'blob' });
  }

  // Redistribution (Adventist only)
  getRedistributions(params?: any): Observable<any> { return this.http.get(`${this.base}/redistributions/`, { params }); }
  getRedistributionRules(params?: any): Observable<any> { return this.http.get(`${this.base}/redistribution-rules/`, { params }); }
  getDesignatedFunds(): Observable<any> { return this.http.get(`${this.base}/designated-funds/`); }
  createRedistributionRule(data: any): Observable<any> { return this.http.post(`${this.base}/redistribution-rules/`, data); }
  updateRedistributionRule(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/redistribution-rules/${id}/`, data); }
  deleteRedistributionRule(id: number): Observable<any> { return this.http.delete(`${this.base}/redistribution-rules/${id}/`); }

  // Notifications
  getNotifications(params?: any): Observable<any> { return this.http.get(`${this.base}/notifications/`, { params }); }
  markNotificationRead(id: number): Observable<any> { return this.http.post(`${this.base}/notifications/${id}/mark_read/`, {}); }
  getUnreadNotificationCount(): Observable<any> { return this.http.get(`${this.base}/notifications/unread_count/`); }
  markAllNotificationsRead(): Observable<any> { return this.http.post(`${this.base}/notifications/mark_all_read/`, {}); }

  // Audit
  getAuditLogs(params?: any): Observable<any> { return this.http.get(`${this.base}/audit-logs/`, { params }); }

  // Reports
  getMembersReport(churchId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (churchId) params = params.set('church', churchId.toString());
    return this.http.get(`${this.base}/reports/members/`, { params, responseType: 'blob' });
  }
  getDonationsReport(churchId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (churchId) params = params.set('church', churchId.toString());
    return this.http.get(`${this.base}/reports/donations/`, { params, responseType: 'blob' });
  }
  getFinancialReport(churchId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (churchId) params = params.set('church', churchId.toString());
    return this.http.get(`${this.base}/reports/financial/`, { params, responseType: 'blob' });
  }
  getFinanceSummaryReport(params?: any): Observable<any> {
    return this.http.get(`${this.base}/financial-report/`, { params });
  }
  getAttendanceReport(churchId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (churchId) params = params.set('church', churchId.toString());
    return this.http.get(`${this.base}/reports/attendance/`, { params, responseType: 'blob' });
  }
  getPastoralReport(churchId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (churchId) params = params.set('church', churchId.toString());
    return this.http.get(`${this.base}/reports/pastoral/`, { params, responseType: 'blob' });
  }
  getAuditReport(churchId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (churchId) params = params.set('church', churchId.toString());
    return this.http.get(`${this.base}/reports/audit/`, { params, responseType: 'blob' });
  }

  // Users
  getUsers(params?: any): Observable<any> { return this.http.get(`${this.base}/users/`, { params }); }
  getUser(id: number): Observable<any> { return this.http.get(`${this.base}/users/${id}/`); }
  updateUser(id: number, data: any): Observable<any> { return this.http.patch(`${this.base}/users/${id}/`, data); }

  // Team (LOCAL_LEADER management)
  getTeam(params?: any): Observable<any> { return this.http.get(`${this.base}/auth/team/`, { params }); }
  createTeamMember(data: any): Observable<any> { return this.http.post(`${this.base}/auth/team/`, data); }
  updateTeamMember(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/auth/team/${id}/`, data); }
  deleteTeamMember(id: number): Observable<any> { return this.http.delete(`${this.base}/auth/team/${id}/`); }

  // Role Assignments
  getRoleAssignments(params?: any): Observable<any> { return this.http.get(`${this.base}/auth/role-assignments/`, { params }); }
  createRoleAssignment(data: any): Observable<any> { return this.http.post(`${this.base}/auth/role-assignments/`, data); }
  updateRoleAssignment(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/auth/role-assignments/${id}/`, data); }
  deleteRoleAssignment(id: number): Observable<any> { return this.http.delete(`${this.base}/auth/role-assignments/${id}/`); }

  // Hierarchy
  getHierarchyTree(): Observable<any> { return this.http.get(`${this.base}/hierarchy/tree/`); }
  getMapEntities(): Observable<any> { return this.http.get(`${this.base}/hierarchy/map/`); }
  getEntities(params?: any): Observable<any> { return this.http.get(`${this.base}/hierarchy/`, { params }); }

  // Dashboard
  getDashboardStats(): Observable<any> { return this.http.get(`${this.base.replace('/api/v1', '')}/api/dashboard/stats/`); }

  // Pastoral
  getPastoralFollowups(params?: any): Observable<any> { return this.http.get(`${this.base}/pastoral-followups/`, { params }); }
  getPastoralFollowup(id: number): Observable<any> { return this.http.get(`${this.base}/pastoral-followups/${id}/`); }
  createPastoralFollowup(data: any): Observable<any> { return this.http.post(`${this.base}/pastoral-followups/`, data); }
  updatePastoralFollowup(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/pastoral-followups/${id}/`, data); }
  deletePastoralFollowup(id: number): Observable<any> { return this.http.delete(`${this.base}/pastoral-followups/${id}/`); }

  // Attendance
  getAttendance(params?: any): Observable<any> { return this.http.get(`${this.base}/worship-sessions/`, { params }); }
  updateWorshipSession(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/worship-sessions/${id}/`, data); }
  deleteWorshipSession(id: number): Observable<any> { return this.http.delete(`${this.base}/worship-sessions/${id}/`); }
  getWorshipSessionPresences(sessionId: number): Observable<any> { return this.http.get(`${this.base}/worship-sessions/${sessionId}/presences/`); }
  addPresence(sessionId: number, data: any): Observable<any> { return this.http.post(`${this.base}/worship-sessions/${sessionId}/presences/`, data); }
  getAttendanceStatistics(): Observable<any> { return this.http.get(`${this.base}/worship-sessions/statistics/`); }

  // Event Participants
  getEventParticipants(eventId: number): Observable<any> { return this.http.get(`${this.base}/events/${eventId}/participants/`); }
  addEventParticipant(eventId: number, data: any): Observable<any> { return this.http.post(`${this.base}/events/${eventId}/participants/`, data); }
  getEventCalendar(eventId: number): Observable<any> { return this.http.get(`${this.base}/events/${eventId}/calendar/`); }

  // Finance - Approval
  approveRecette(id: number): Observable<any> { return this.http.post(`${this.base}/recettes/${id}/approve/`, {}); }
  rejectRecette(id: number): Observable<any> { return this.http.post(`${this.base}/recettes/${id}/reject/`, {}); }
  approveDepense(id: number): Observable<any> { return this.http.post(`${this.base}/depenses/${id}/approve/`, {}); }
  rejectDepense(id: number): Observable<any> { return this.http.post(`${this.base}/depenses/${id}/reject/`, {}); }

  // Budget
  createBudget(data: any): Observable<any> { return this.http.post(`${this.base}/budgets/`, data); }
  updateBudget(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/budgets/${id}/`, data); }
  deleteBudget(id: number): Observable<any> { return this.http.delete(`${this.base}/budgets/${id}/`); }
  getBudgetReport(budgetId: number): Observable<any> { return this.http.get(`${this.base}/budgets/${budgetId}/report/`); }
  getBudgetLines(params?: any): Observable<any> { return this.http.get(`${this.base}/budget-lines/`, { params }); }
  createBudgetLine(data: any): Observable<any> { return this.http.post(`${this.base}/budget-lines/`, data); }
  updateBudgetLine(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/budget-lines/${id}/`, data); }
  deleteBudgetLine(id: number): Observable<any> { return this.http.delete(`${this.base}/budget-lines/${id}/`); }

  // Financial Categories CRUD
  createFinancialCategory(data: any): Observable<any> { return this.http.post(`${this.base}/financial-categories/`, data); }
  updateFinancialCategory(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/financial-categories/${id}/`, data); }
  deleteFinancialCategory(id: number): Observable<any> { return this.http.delete(`${this.base}/financial-categories/${id}/`); }

  // Designated Funds CRUD
  createDesignatedFund(data: any): Observable<any> { return this.http.post(`${this.base}/designated-funds/`, data); }
  updateDesignatedFund(id: number, data: any): Observable<any> { return this.http.put(`${this.base}/designated-funds/${id}/`, data); }
  deleteDesignatedFund(id: number): Observable<any> { return this.http.delete(`${this.base}/designated-funds/${id}/`); }

  // Pastoral Close
  closePastoralFollowup(id: number): Observable<any> { return this.http.post(`${this.base}/pastoral-followups/${id}/close/`, {}); }

  // Redistribution Actions
  activateRedistributionRule(id: number): Observable<any> { return this.http.post(`${this.base}/redistribution-rules/${id}/activate/`, {}); }
  validateRedistributionRuleTotal(id: number): Observable<any> { return this.http.get(`${this.base}/redistribution-rules/${id}/validate_total/`); }
  getRedistributionSummary(): Observable<any> { return this.http.get(`${this.base}/redistributions/summary/`); }

  // Department Memberships
  getDepartmentMemberships(params?: any): Observable<any> { return this.http.get(`${this.base}/department-memberships/`, { params }); }
  createDepartmentMembership(data: any): Observable<any> { return this.http.post(`${this.base}/department-memberships/`, data); }
  deleteDepartmentMembership(id: number): Observable<any> { return this.http.delete(`${this.base}/department-memberships/${id}/`); }

  // Export/Import
  exportMembersExcel(): Observable<Blob> {
    return this.http.get(`${this.base}/members/export/excel/`, { responseType: 'blob' });
  }
  importMembersExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.base}/members/import/excel/`, formData);
  }
  exportDonationsExcel(): Observable<Blob> {
    return this.http.get(`${this.base}/donations/export/excel/`, { responseType: 'blob' });
  }
}
