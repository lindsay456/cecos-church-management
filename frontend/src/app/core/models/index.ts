export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: string;
  entity: number | null;
  entity_name: string;
  entity_code: string;
  entity_type: string;
  entity_denomination: string;
  is_active: boolean;
  last_login: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Church {
  id: number;
  name: string;
  code: string;
  entity_type: string;
  denomination: string;
  country: string;
  city: string;
  address: string;
  gps_lat: number;
  gps_lng: number;
  members_count: number;
  families_count: number;
  is_active: boolean;
}

export interface Chapel {
  id: number;
  name: string;
  code: string;
  church: number;
  church_name: string;
  address: string;
  city: string;
  neighborhood: string;
  leader: number;
  leader_name: string;
  gps_lat: number;
  gps_lng: number;
  is_active: boolean;
  members_count: number;
}

export interface Member {
  id: number;
  member_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string;
  birth_date: string;
  phone: string;
  email: string;
  status: string;
  church: number;
  church_name: string;
  chapel: number | null;
  family: number | null;
  family_name: string;
  membership_date: string;
  is_active: boolean;
}

export interface Visitor {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  church: number;
  church_name: string;
  first_visit_date: string;
  invited_by: number | null;
  invited_by_name: string;
  wants_follow_up: boolean;
  consent_contact: boolean;
  follow_up_status: string;
  follow_up_status_display: string;
  created_at: string;
}

export interface Family {
  id: number;
  family_code: string;
  name: string;
  church: number;
  church_name: string;
  address: string;
  main_phone: string;
  household_head: number | null;
  household_head_name: string;
  status: string;
  members_count: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  church: number;
  church_name: string;
  department_type: string;
  leader: number | null;
  leader_name: string;
  is_active: boolean;
  members_count: number;
}

export interface Event {
  id: number;
  title: string;
  event_type: string;
  church: number;
  church_name: string;
  department: number | null;
  start_datetime: string;
  end_datetime: string;
  location: string;
  status: string;
  participants_count: number;
}

export interface WorshipSession {
  id: number;
  church: number;
  church_name: string;
  chapel: number | null;
  service_type: string;
  date: string;
  men_count: number;
  women_count: number;
  children_count: number;
  visitors_count: number;
  total_count: number;
}

export interface Recette {
  id: number;
  church: number;
  category: number;
  category_name: string;
  amount: number;
  date: string;
  source: string;
  payment_method: string;
  status: string;
}

export interface Depense {
  id: number;
  church: number;
  category: number;
  category_name: string;
  amount: number;
  date: string;
  beneficiary: string;
  payment_method: string;
  status: string;
}

export interface Don {
  id: number;
  donation_number: string;
  member: number;
  member_name: string;
  church: number;
  donation_type: string;
  amount: number;
  donation_date: string;
  status: string;
  payment_method: string;
}

export interface Redistribution {
  id: number;
  donation: number;
  donation_number: string;
  source_entity: number;
  source_entity_name: string;
  destination_type: string;
  transferred_amount: number;
  applied_percentage: number;
  calculation_date: string;
}

export interface Notification {
  id: number;
  channel: string;
  notification_type: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user: number;
  user_full_name: string;
  action: string;
  app_label: string;
  model_name: string;
  object_repr: string;
  created_at: string;
}

export interface DashboardStats {
  active_members: number;
  families: number;
  last_worship_count: number;
  visitors: number;
  upcoming_events: number;
  month_recettes: number;
  month_depenses: number;
  budget_consumed: number;
  month_tithes: number;
  month_offerings: number;
  open_pastoral: number;
}
