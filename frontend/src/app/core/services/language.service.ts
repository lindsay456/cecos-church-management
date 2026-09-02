import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'fr' | 'en';

const TRANSLATIONS: Record<string, Record<Lang, string>> = {
  'dashboard': { fr: 'Tableau de bord', en: 'Dashboard' },
  'members': { fr: 'Membres', en: 'Members' },
  'families': { fr: 'Familles', en: 'Families' },
  'chapels': { fr: 'Chapelles', en: 'Chapels' },
  'team': { fr: 'Mon equipe', en: 'My Team' },
  'departments': { fr: 'Departements', en: 'Departments' },
  'events': { fr: 'Evenements', en: 'Events' },
  'attendance': { fr: 'Presences', en: 'Attendance' },
  'visitors': { fr: 'Visiteurs', en: 'Visitors' },
  'finance': { fr: 'Finance', en: 'Finance' },
  'donations': { fr: 'Dons', en: 'Donations' },
  'redistribution': { fr: 'Redistribution', en: 'Redistribution' },
  'pastoral': { fr: 'Suivi pastoral', en: 'Pastoral Care' },
  'reports': { fr: 'Rapports', en: 'Reports' },
  'audit': { fr: 'Journal d\'audit', en: 'Audit Log' },
  'settings': { fr: 'Parametres', en: 'Settings' },
  'help': { fr: 'Aide', en: 'Help' },
  'logout': { fr: 'Deconnexion', en: 'Logout' },
  'search': { fr: 'Rechercher...', en: 'Search...' },
  'welcome': { fr: 'Bonjour', en: 'Hello' },
  'today': { fr: 'Aujourd\'hui', en: 'Today' },
  'notifications': { fr: 'Notifications', en: 'Notifications' },
  'mark_all_read': { fr: 'Tout marquer lu', en: 'Mark all read' },
  'no_notifications': { fr: 'Aucune notification', en: 'No notifications' },
  'active_members': { fr: 'Membres actifs', en: 'Active Members' },
  'families_count': { fr: 'Familles', en: 'Families' },
  'chapels_count': { fr: 'Chapelles', en: 'Chapels' },
  'last_worship': { fr: 'Dernier culte', en: 'Last Worship' },
  'visitors_count': { fr: 'Visiteurs', en: 'Visitors' },
  'departments_count': { fr: 'Departements', en: 'Departments' },
  'finance_month': { fr: 'Finances du mois', en: 'Monthly Finances' },
  'income': { fr: 'Recettes', en: 'Income' },
  'expenses': { fr: 'Depenses', en: 'Expenses' },
  'budget_consumed': { fr: 'Budget consomme', en: 'Budget Consumed' },
  'recent_donations': { fr: 'Dons recents', en: 'Recent Donations' },
  'tithes': { fr: 'Dimes', en: 'Tithes' },
  'offerings': { fr: 'Offrandes', en: 'Offerings' },
  'upcoming_events': { fr: 'Prochains evenements', en: 'Upcoming Events' },
  'see_all': { fr: 'Voir tout', en: 'See All' },
  'pastoral_alert': { fr: 'Suivi pastoral', en: 'Pastoral Care' },
  'cases_pending': { fr: 'cas en attente', en: 'cases pending' },
  'manage': { fr: 'Gerer', en: 'Manage' },
  'chapel_map': { fr: 'Carte des chapelles', en: 'Chapel Map' },
  'map_subtitle': { fr: 'Localisation des chapelles', en: 'Chapel Locations' },
  'search_chapel': { fr: 'Rechercher une chapelle...', en: 'Search for a chapel...' },
  'monthly_income': { fr: 'Recettes du mois', en: 'Monthly Income' },
  'monthly_expenses': { fr: 'Depenses du mois', en: 'Monthly Expenses' },
  'tithes_received': { fr: 'Dimes recus', en: 'Tithes Received' },
  'financial_summary': { fr: 'Resume financier complet', en: 'Full Financial Summary' },
  'manage_finance': { fr: 'Gerer les finances', en: 'Manage Finances' },
  'donations_link': { fr: 'Voir tout', en: 'See All' },
  'generate_reports': { fr: 'Generez des rapports financiers', en: 'Generate financial reports' },
  'my_departments': { fr: 'Mes departements', en: 'My Departments' },
  'manage_departments': { fr: 'Gerez vos departements', en: 'Manage your departments' },
  'record_attendance': { fr: 'Enregistrer une presence', en: 'Record Attendance' },
  'take_attendance': { fr: 'Saisir les presences', en: 'Take Attendance' },
  'no_attendance': { fr: 'Aucune presence enregistree', en: 'No attendance recorded' },
  'open_followups': { fr: 'Suivis ouverts', en: 'Open Follow-ups' },
  'active_members_count': { fr: 'Membres actifs', en: 'Active Members' },
  'attention': { fr: 'Attention', en: 'Attention' },
  'cases_waiting': { fr: 'cas en attente de suivi', en: 'cases awaiting follow-up' },
  'audit_log': { fr: 'Journal d\'audit', en: 'Audit Log' },
  'download_reports': { fr: 'Telecharger', en: 'Download' },
  'audit_consult': { fr: 'Consultez l\'historique des actions effectuees', en: 'View history of actions performed' },
  'welcome_member': { fr: 'Bienvenue', en: 'Welcome' },
  'welcome_subtitle': { fr: 'Consultez vos informations et suivez vos contributions.', en: 'View your information and track your contributions.' },
  'church_map_title': { fr: 'Carte des eglises', en: 'Church Map' },
  'redistribution_module': { fr: 'Module de redistribution disponible', en: 'Redistribution module available' },
  'all': { fr: 'Tous', en: 'All' },
  'date': { fr: 'Date', en: 'Date' },
  'type': { fr: 'Type', en: 'Type' },
  'chapel': { fr: 'Chapelle', en: 'Chapel' },
  'men': { fr: 'H', en: 'M' },
  'women': { fr: 'F', en: 'W' },
  'children': { fr: 'E', en: 'C' },
  'visitors_short': { fr: 'V', en: 'V' },
  'total': { fr: 'Total', en: 'Total' },
  'no_events': { fr: 'Aucun evenement', en: 'No events' },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private langSubject = new BehaviorSubject<Lang>(this.getStored());
  lang$ = this.langSubject.asObservable();

  constructor() {}

  get current(): Lang {
    return this.langSubject.value;
  }

  toggle(): void {
    const next = this.langSubject.value === 'fr' ? 'en' : 'fr';
    this.set(next);
  }

  set(lang: Lang): void {
    this.langSubject.next(lang);
    localStorage.setItem('cecos_lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }

  t(key: string): string {
    const lang = this.langSubject.value;
    return TRANSLATIONS[key]?.[lang] || key;
  }

  private getStored(): Lang {
    const stored = localStorage.getItem('cecos_lang');
    if (stored === 'fr' || stored === 'en') return stored;
    return 'fr';
  }
}
