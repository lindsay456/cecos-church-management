"""Enums globaux de l'application (TextChoices)."""
from __future__ import annotations

from django.db import models


class Denomination(models.TextChoices):
    CATHOLIC = "CATHOLIC", "Catholique"
    PROTESTANT = "PROTESTANT", "Protestante"
    ADVENTIST = "ADVENTIST", "Adventiste"


class UserRole(models.TextChoices):
    SUPER_ADMIN = "SUPER_ADMIN", "Super administrateur"
    DIVISION_ADMIN = "DIVISION_ADMIN", "Administrateur de Division"
    UNION_ADMIN = "UNION_ADMIN", "Administrateur d'Union"
    FEDERATION_ADMIN = "FEDERATION_ADMIN", "Administrateur de Federation"
    LOCAL_LEADER = "LOCAL_LEADER", "Leader local"
    TREASURER = "TREASURER", "Tresorier"
    DEPARTMENT_LEADER = "DEPARTMENT_LEADER", "Responsable de departement"
    PASTORAL_LEADER = "PASTORAL_LEADER", "Responsable pastoral"
    CHAPEL_LEADER = "CHAPEL_LEADER", "Responsable de chapelle"
    AUDITOR = "AUDITOR", "Auditeur"
    MEMBER = "MEMBER", "Membre"


class EntityType(models.TextChoices):
    GENERAL_CONFERENCE = "GENERAL_CONFERENCE", "Conférence Générale"
    DIVISION = "DIVISION", "Division"
    UNION = "UNION", "Union"
    FEDERATION = "FEDERATION", "Fédération"
    MISSION = "MISSION", "Mission"
    LOCAL_CHURCH = "LOCAL_CHURCH", "Église locale"
    DIOCESE = "DIOCESE", "Diocèse"
    PARISH = "PARISH", "Paroisse"
    PROTESTANT_UNION = "PROTESTANT_UNION", "Union Protestante"
    PROTESTANT_CHURCH = "PROTESTANT_CHURCH", "Église Protestante"


class MemberStatus(models.TextChoices):
    PROSPECT = "PROSPECT", "Prospect"
    ACTIVE = "ACTIVE", "Actif"
    INACTIVE = "INACTIVE", "Inactif"
    TRANSFERRED = "TRANSFERRED", "Transféré"
    SUSPENDED = "SUSPENDED", "Suspendu"
    DECEASED = "DECEASED", "Décédé"
    ARCHIVED = "ARCHIVED", "Archivé"


class Gender(models.TextChoices):
    MALE = "MALE", "Masculin"
    FEMALE = "FEMALE", "Féminin"
    OTHER = "OTHER", "Autre"


class MaritalStatus(models.TextChoices):
    SINGLE = "SINGLE", "Célibataire"
    MARRIED = "MARRIED", "Marié(e)"
    DIVORCED = "DIVORCED", "Divorcé(e)"
    WIDOWED = "WIDOWED", "Veuf/Veuve"
    OTHER = "OTHER", "Autre"


class TransferStatus(models.TextChoices):
    PENDING = "PENDING", "En attente"
    APPROVED = "APPROVED", "Approuvé"
    REJECTED = "REJECTED", "Rejeté"
    CANCELLED = "CANCELLED", "Annulé"


class FamilyStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    INACTIVE = "INACTIVE", "Inactive"


class DepartmentType(models.TextChoices):
    ADMINISTRATION = "ADMINISTRATION", "Administration"
    WORSHIP = "WORSHIP", "Culte et adoration"
    MUSIC = "MUSIC", "Musique"
    YOUTH = "YOUTH", "Jeunesse"
    SABBATH_SCHOOL = "SABBATH_SCHOOL", "École du Sabbat"
    CHILDREN = "CHILDREN", "Enfants"
    WOMEN = "WOMEN", "Femmes"
    MEN = "MEN", "Hommes"
    SOCIAL = "SOCIAL", "Action sociale"
    COMMUNICATION = "COMMUNICATION", "Communication"
    OTHER = "OTHER", "Autre"


class EventType(models.TextChoices):
    WORSHIP = "WORSHIP", "Culte"
    MEETING = "MEETING", "Réunion"
    CONFERENCE = "CONFERENCE", "Conférence"
    OUTREACH = "OUTREACH", "Évangélisation"
    YOUTH = "YOUTH", "Jeunesse"
    CHARITY = "CHARITY", "Charité"
    TRAINING = "TRAINING", "Formation"
    CELEBRATION = "CELEBRATION", "Célébration"
    OTHER = "OTHER", "Autre"


class EventStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    PLANNED = "PLANNED", "Planifié"
    PUBLISHED = "PUBLISHED", "Publié"
    COMPLETED = "COMPLETED", "Terminé"
    CANCELLED = "CANCELLED", "Annulé"


class ParticipantStatus(models.TextChoices):
    INVITED = "INVITED", "Invité"
    REGISTERED = "REGISTERED", "Inscrit"
    PRESENT = "PRESENT", "Présent"
    ABSENT = "ABSENT", "Absent"
    EXCUSED = "EXCUSED", "Excusé"


class PresenceStatus(models.TextChoices):
    PRESENT = "PRESENT", "Présent"
    ABSENT = "ABSENT", "Absent"
    EXCUSED = "EXCUSED", "Excusé"


class ServiceType(models.TextChoices):
    SABBATH = "SABBATH", "Sabbat"
    SUNDAY = "SUNDAY", "Dimanche"
    WEDNESDAY = "WEDNESDAY", "Mercredi"
    FRIDAY = "FRIDAY", "Vendredi"
    SPECIAL = "SPECIAL", "Spécial"
    OTHER = "OTHER", "Autre"


class VisitorStatus(models.TextChoices):
    NEW = "NEW", "Nouveau"
    TO_CONTACT = "TO_CONTACT", "À contacter"
    CONTACTED = "CONTACTED", "Contacté"
    RETURNED = "RETURNED", "Revenu"
    BECAME_MEMBER = "BECAME_MEMBER", "Devenu membre"
    DO_NOT_CONTACT = "DO_NOT_CONTACT", "Ne pas contacter"
    ARCHIVED = "ARCHIVED", "Archivé"


class CategoryType(models.TextChoices):
    INCOME = "INCOME", "Recette"
    EXPENSE = "EXPENSE", "Dépense"


class FinancialStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    SUBMITTED = "SUBMITTED", "Soumis"
    APPROVED = "APPROVED", "Approuvé"
    REJECTED = "REJECTED", "Rejeté"
    CANCELLED = "CANCELLED", "Annulé"


class BudgetStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    SUBMITTED = "SUBMITTED", "Soumis"
    APPROVED = "APPROVED", "Approuvé"
    CLOSED = "CLOSED", "Clôturé"


class PaymentMethod(models.TextChoices):
    CASH = "CASH", "Espèces"
    BANK_TRANSFER = "BANK_TRANSFER", "Virement bancaire"
    MOBILE_MONEY = "MOBILE_MONEY", "Mobile money"
    CHECK = "CHECK", "Chèque"
    CARD = "CARD", "Carte"
    OTHER = "OTHER", "Autre"


class DonationType(models.TextChoices):
    TITHE = "TITHE", "Dîme"
    GENERAL_OFFERING = "GENERAL_OFFERING", "Offrande générale"
    SPECIAL_OFFERING = "SPECIAL_OFFERING", "Offrande spéciale"
    DESIGNATED_FUND = "DESIGNATED_FUND", "Fonds désigné"
    OTHER = "OTHER", "Autre"


class DonationStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    PENDING_VALIDATION = "PENDING_VALIDATION", "En attente de validation"
    VALIDATED = "VALIDATED", "Validé"
    REJECTED = "REJECTED", "Rejeté"
    CANCELLATION_REQUESTED = "CANCELLATION_REQUESTED", "Annulation demandée"
    CANCELLED = "CANCELLED", "Annulé"
    CORRECTED = "CORRECTED", "Corrigé"


class ReceiptStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    ISSUED = "ISSUED", "Émis"
    SENT = "SENT", "Envoyé"
    CANCELLED = "CANCELLED", "Annulé"


class PastoralActionType(models.TextChoices):
    VISIT = "VISIT", "Visite"
    PHONE_CALL = "PHONE_CALL", "Appel téléphonique"
    COUNSELING = "COUNSELING", "Conseil"
    PRAYER = "PRAYER", "Prière"
    FAMILY_SUPPORT = "FAMILY_SUPPORT", "Soutien familial"
    SOCIAL_ASSISTANCE = "SOCIAL_ASSISTANCE", "Assistance sociale"
    SPIRITUAL_SUPPORT = "SPIRITUAL_SUPPORT", "Soutien spirituel"
    OTHER = "OTHER", "Autre"


class PastoralStatus(models.TextChoices):
    OPEN = "OPEN", "Ouvert"
    IN_PROGRESS = "IN_PROGRESS", "En cours"
    PENDING = "PENDING", "En attente"
    CLOSED = "CLOSED", "Clôturé"
    ARCHIVED = "ARCHIVED", "Archivé"


class ConfidentialityLevel(models.TextChoices):
    STANDARD = "STANDARD", "Standard"
    RESTRICTED = "RESTRICTED", "Restreint"
    HIGHLY_CONFIDENTIAL = "HIGHLY_CONFIDENTIAL", "Hautement confidentiel"


class NotificationChannel(models.TextChoices):
    EMAIL = "EMAIL", "Email"
    WHATSAPP = "WHATSAPP", "WhatsApp"
    IN_APP = "IN_APP", "Dans l'application"


class NotificationType(models.TextChoices):
    RECEIPT = "RECEIPT", "Reçu"
    DONATION_VALIDATED = "DONATION_VALIDATED", "Don validé"
    DONATION_CANCELLED = "DONATION_CANCELLED", "Don annulé"
    EVENT_REMINDER = "EVENT_REMINDER", "Rappel d'événement"
    EVENT_UPDATED = "EVENT_UPDATED", "Événement modifié"
    BUDGET_ALERT = "BUDGET_ALERT", "Alerte budget"
    TRANSFER_REQUEST = "TRANSFER_REQUEST", "Demande de transfert"
    TRANSFER_APPROVED = "TRANSFER_APPROVED", "Transfert approuvé"
    PASSWORD_RESET = "PASSWORD_RESET", "Réinitialisation du mot de passe"
    SECURITY_ALERT = "SECURITY_ALERT", "Alerte sécurité"
    WELCOME = "WELCOME", "Bienvenue"
    OTHER = "OTHER", "Autre"


class NotificationStatus(models.TextChoices):
    PENDING = "PENDING", "En attente"
    SENT = "SENT", "Envoyé"
    FAILED = "FAILED", "Échec"
    READ = "READ", "Lu"


class RuleDestinationType(models.TextChoices):
    HIERARCHICAL_LEVEL = "HIERARCHICAL_LEVEL", "Niveau hiérarchique"
    DESIGNATED_FUND = "DESIGNATED_FUND", "Fonds affecté"


class RedistributionStatus(models.TextChoices):
    COMPUTED = "COMPUTED", "Calculée"
    CORRECTED = "CORRECTED", "Corrigée"
    CANCELLED = "CANCELLED", "Annulée"


class AuditAction(models.TextChoices):
    CREATE = "CREATE", "Création"
    UPDATE = "UPDATE", "Modification"
    DELETE = "DELETE", "Suppression"
    ARCHIVE = "ARCHIVE", "Archivage"
    LOGIN = "LOGIN", "Connexion"
    LOGIN_FAILED = "LOGIN_FAILED", "Échec de connexion"
    LOGOUT = "LOGOUT", "Déconnexion"
    PASSWORD_CHANGE = "PASSWORD_CHANGE", "Changement de mot de passe"
    TRANSFER = "TRANSFER", "Transfert"
    VALIDATE = "VALIDATE", "Validation"
    REJECT = "REJECT", "Rejet"
    CANCEL = "CANCEL", "Annulation"
    CORRECT = "CORRECT", "Correction"
    EXPORT = "EXPORT", "Export"
    DOWNLOAD = "DOWNLOAD", "Téléchargement"
    VIEW = "VIEW", "Consultation"
    ROLE_CHANGE = "ROLE_CHANGE", "Changement de rôle"
    RECEIPT_GENERATED = "RECEIPT_GENERATED", "Reçu généré"


class RuleStatus(models.TextChoices):
    DRAFT = "DRAFT", "Brouillon"
    ACTIVE = "ACTIVE", "Active"
    SUPERSEDED = "SUPERSEDED", "Remplacée"
    RETIRED = "RETIRED", "Retirée"
