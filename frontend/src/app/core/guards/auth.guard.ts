import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ADMIN_ROLES, Role, hasRole } from '../constants/roles';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser;
  if (user && hasRole(user.role, ADMIN_ROLES)) return true;
  router.navigate(['/app/dashboard']);
  return false;
};

export const roleGuard = (...allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser;
    if (user && hasRole(user.role, allowedRoles)) return true;
    router.navigate(['/app/dashboard']);
    return false;
  };
};
