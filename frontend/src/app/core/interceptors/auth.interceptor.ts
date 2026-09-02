import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  if (token && !req.url.includes('/auth/login/') && !req.url.includes('/auth/refresh/') && !req.url.includes('/register/')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !req.url.includes('/auth/login/') && !req.url.includes('/auth/refresh/')) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            return auth.refreshToken().pipe(
              switchMap((res: any) => {
                isRefreshing = false;
                localStorage.setItem('access_token', res.access);
                req = req.clone({ setHeaders: { Authorization: `Bearer ${res.access}` } });
                return next(req);
              }),
              catchError(() => {
                isRefreshing = false;
                auth.logout();
                router.navigate(['/login']);
                return throwError(() => error);
              })
            );
          } else {
            isRefreshing = false;
            auth.logout();
            router.navigate(['/login']);
          }
        }
      }
      return throwError(() => error);
    })
  );
};
