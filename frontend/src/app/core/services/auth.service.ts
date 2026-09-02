import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('user');
    if (saved) this.userSubject.next(JSON.parse(saved));
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get denomination(): string {
    const u = this.currentUser as any;
    return u?.entity_denomination || '';
  }

  get isAdventist(): boolean {
    const u = this.currentUser as any;
    return u?.entity_denomination === 'ADVENTIST';
  }

  get isCatholic(): boolean {
    return this.denomination === 'CATHOLIC';
  }

  get isProtestant(): boolean {
    return this.denomination === 'PROTESTANT';
  }

  get userRole(): string {
    const u = this.currentUser as any;
    return u?.role || '';
  }

  get isLocalLeader(): boolean {
    return this.userRole === 'LOCAL_LEADER';
  }

  get isTreasurer(): boolean {
    return this.userRole === 'TREASURER';
  }

  get isDeptLeader(): boolean {
    return this.userRole === 'DEPARTMENT_LEADER';
  }

  get isPastoralLeader(): boolean {
    return this.userRole === 'PASTORAL_LEADER';
  }

  get isChapelLeader(): boolean {
    return this.userRole === 'CHAPEL_LEADER';
  }

  get isAuditor(): boolean {
    return this.userRole === 'AUDITOR';
  }

  get isMember(): boolean {
    return this.userRole === 'MEMBER';
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login/`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register/`, data).pipe(
      tap((res: any) => {
        if (res.access) {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }
      })
    );
  }

  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      this.http.post(`${environment.apiUrl}/auth/logout/`, { refresh }).subscribe();
    }
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post<{ access: string }>(`${environment.apiUrl}/auth/refresh/`, { refresh });
  }

  changePassword(old_password: string, new_password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/change-password/`, { old_password, new_password });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me/`);
  }

  reloadUser(): void {
    this.getProfile().subscribe({
      next: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      }
    });
  }
}
