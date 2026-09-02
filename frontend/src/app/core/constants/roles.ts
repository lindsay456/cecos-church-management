export const ROLES = {
  LOCAL_LEADER: 'LOCAL_LEADER',
  TREASURER: 'TREASURER',
  DEPARTMENT_LEADER: 'DEPARTMENT_LEADER',
  PASTORAL_LEADER: 'PASTORAL_LEADER',
  CHAPEL_LEADER: 'CHAPEL_LEADER',
  AUDITOR: 'AUDITOR',
  MEMBER: 'MEMBER',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  LOCAL_LEADER: 'Leader local',
  TREASURER: 'Tresorier',
  DEPARTMENT_LEADER: 'Responsable de departement',
  PASTORAL_LEADER: 'Responsable pastoral',
  CHAPEL_LEADER: 'Responsable de chapelle',
  AUDITOR: 'Auditeur',
  MEMBER: 'Membre',
};

export const ADMIN_ROLES: Role[] = [
  ROLES.LOCAL_LEADER,
];

export const CAN_MANAGE_USERS: Role[] = [
  ROLES.LOCAL_LEADER,
];

export const CAN_VIEW_AUDIT: Role[] = [
  ROLES.LOCAL_LEADER,
  ROLES.AUDITOR,
];

export const CAN_VIEW_FINANCE: Role[] = [
  ROLES.LOCAL_LEADER,
  ROLES.TREASURER,
];

export const CAN_VIEW_REPORTS: Role[] = [
  ROLES.LOCAL_LEADER,
  ROLES.TREASURER,
  ROLES.AUDITOR,
];

export const CAN_MANAGE_DEPARTMENTS: Role[] = [
  ROLES.LOCAL_LEADER,
  ROLES.DEPARTMENT_LEADER,
];

export const CAN_VIEW_PASTORAL: Role[] = [
  ROLES.LOCAL_LEADER,
  ROLES.PASTORAL_LEADER,
];

export const CAN_MANAGE_ATTENDANCE: Role[] = [
  ROLES.LOCAL_LEADER,
  ROLES.CHAPEL_LEADER,
];

export const CAN_VIEW_REDISTRIBUTION: Role[] = [
  ROLES.LOCAL_LEADER,
  ROLES.TREASURER,
];

export const CAN_MANAGE_SETTINGS: Role[] = [
  ROLES.LOCAL_LEADER,
];

export function hasRole(userRole: string | undefined, allowed: Role[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as Role);
}

export function isAdmin(role: string | undefined): boolean {
  return hasRole(role, ADMIN_ROLES);
}

export function isSuperAdmin(role: string | undefined): boolean {
  return role === ROLES.LOCAL_LEADER;
}
