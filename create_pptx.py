 #!/usr/bin/env python3
"""
Générateur de PowerPoint - Rapport de Stage Académique
Projet: Ecclesia Gestion - Système de Gestion Administrative des Églises
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# ─── COLOUR PALETTE ───────────────────────────────────────────
NAVY       = RGBColor(0x0B, 0x1D, 0x3A)
DARK_BLUE  = RGBColor(0x14, 0x2D, 0x5E)
MID_BLUE   = RGBColor(0x1E, 0x56, 0xA0)
ACCENT     = RGBColor(0x3C, 0x96, 0xD4)
GOLD       = RGBColor(0xD4, 0xA0, 0x3C)
LIGHT_GOLD = RGBColor(0xF5, 0xE6, 0xB8)
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_GRAY = RGBColor(0xF0, 0xF2, 0xF5)
DARK_GRAY  = RGBColor(0x33, 0x33, 0x33)
MED_GRAY   = RGBColor(0x66, 0x66, 0x66)
SOFT_BG    = RGBColor(0xE8, 0xF0, 0xFE)
SECTION_BG = RGBColor(0x0F, 0x2B, 0x52)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)


# ─── HELPERS ──────────────────────────────────────────────────
def add_shape(slide, left, top, width, height, fill_color, alpha=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()
    return shape


def add_text_box(slide, left, top, width, height, text, font_size=18,
                 color=WHITE, bold=False, alignment=PP_ALIGN.LEFT,
                 font_name="Calibri", line_spacing=1.2):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    p.space_after = Pt(4)
    for p in tf.paragraphs:
        p.line_spacing = Pt(font_size * line_spacing)
    return txBox


def add_multi_text(slide, left, top, width, height, items, font_size=16,
                   color=WHITE, bold=False, alignment=PP_ALIGN.LEFT,
                   font_name="Calibri", bullet=False, line_spacing=1.4):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        prefix = "●  " if bullet else ""
        p.text = prefix + item
        p.font.size = Pt(font_size)
        p.font.color.rgb = color
        p.font.bold = bold
        p.font.name = font_name
        p.alignment = alignment
        p.space_after = Pt(6)
        p.line_spacing = Pt(font_size * line_spacing)
    return txBox


def add_circle(slide, left, top, size, fill_color):
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, left, top, size, size)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()
    return shape


def add_rounded_rect(slide, left, top, width, height, fill_color):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()
    return shape


def add_card(slide, left, top, width, height, title, items, icon_color=ACCENT):
    card = add_rounded_rect(slide, left, top, width, height, WHITE)
    card.shadow.inherit = False

    add_circle(slide, left + Inches(0.3), top + Inches(0.3), Inches(0.5), icon_color)
    add_text_box(slide, left + Inches(1.0), top + Inches(0.25), width - Inches(1.3), Inches(0.5),
                 title, font_size=16, color=NAVY, bold=True)
    add_multi_text(slide, left + Inches(0.3), top + Inches(0.9), width - Inches(0.6),
                   height - Inches(1.0), items, font_size=12, color=DARK_GRAY, bullet=True)
    return card


def slide_number(slide, num):
    add_text_box(slide, SLIDE_W - Inches(1.2), SLIDE_H - Inches(0.5), Inches(1), Inches(0.4),
                 str(num), font_size=10, color=MED_GRAY, alignment=PP_ALIGN.RIGHT)


def section_header_slide(prs, title, subtitle, section_num):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_shape(slide, 0, 0, SLIDE_W, SLIDE_H, SECTION_BG)
    add_shape(slide, 0, SLIDE_H - Inches(0.15), SLIDE_W, Inches(0.15), GOLD)
    add_shape(slide, Inches(0.8), Inches(2.5), Inches(1.2), Inches(0.06), GOLD)
    add_text_box(slide, Inches(0.8), Inches(1.2), Inches(10), Inches(0.6),
                 f"SECTION {section_num}", font_size=14, color=GOLD, bold=True,
                 font_name="Calibri Light")
    add_text_box(slide, Inches(0.8), Inches(2.7), Inches(11), Inches(1.2),
                 title, font_size=44, color=WHITE, bold=True, font_name="Calibri Light")
    add_text_box(slide, Inches(0.8), Inches(4.0), Inches(9), Inches(1.0),
                 subtitle, font_size=18, color=RGBColor(0xA0, 0xC4, 0xE8), font_name="Calibri Light")
    return slide


# ─── CREATE PRESENTATION ─────────────────────────────────────
prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H

# ══════════════════════════════════════════════════════════════
# SLIDE 1 — PAGE DE TITRE
# ══════════════════════════════════════════════════════════════
s1 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s1, 0, 0, SLIDE_W, SLIDE_H, NAVY)
add_shape(s1, 0, 0, Inches(0.4), SLIDE_H, GOLD)
add_shape(s1, 0, SLIDE_H - Inches(0.1), SLIDE_W, Inches(0.1), GOLD)

# Decorative elements
add_circle(s1, Inches(10.5), Inches(0.5), Inches(2.5), DARK_BLUE)
add_circle(s1, Inches(11.0), Inches(4.5), Inches(1.8), DARK_BLUE)

add_text_box(s1, Inches(1.2), Inches(1.0), Inches(10), Inches(0.6),
             "RAPPORT DE STAGE ACADÉMIQUE", font_size=16, color=GOLD,
             bold=True, font_name="Calibri Light", alignment=PP_ALIGN.LEFT)

add_shape(s1, Inches(1.2), Inches(1.8), Inches(2.0), Inches(0.05), GOLD)

add_text_box(s1, Inches(1.2), Inches(2.1), Inches(10), Inches(2.0),
             "Ecclesia Gestion", font_size=54, color=WHITE, bold=True,
             font_name="Calibri Light")
add_text_box(s1, Inches(1.2), Inches(3.6), Inches(10), Inches(1.0),
             "Système de Gestion Administrative,\nPastorale et Financière des Églises",
             font_size=22, color=RGBColor(0xA0, 0xC4, 0xE8), font_name="Calibri Light")

add_shape(s1, Inches(1.2), Inches(5.0), Inches(4.5), Inches(0.03), RGBColor(0x30, 0x50, 0x80))

add_text_box(s1, Inches(1.2), Inches(5.3), Inches(6), Inches(0.4),
             "Stagiaire : Lindsay Sarah", font_size=16, color=WHITE, font_name="Calibri")
add_text_box(s1, Inches(1.2), Inches(5.7), Inches(6), Inches(0.4),
             "Année Académique 2025 – 2026", font_size=14, color=MED_GRAY, font_name="Calibri")


# ══════════════════════════════════════════════════════════════
# SLIDE 2 — SOMMAIRE
# ══════════════════════════════════════════════════════════════
s2 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s2, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_shape(s2, 0, 0, SLIDE_W, Inches(1.6), NAVY)
add_shape(s2, 0, Inches(1.6), SLIDE_W, Inches(0.06), GOLD)

add_text_box(s2, Inches(0.8), Inches(0.4), Inches(10), Inches(1.0),
             "SOMMAIRE", font_size=36, color=WHITE, bold=True, font_name="Calibri Light")
add_text_box(s2, Inches(0.8), Inches(1.0), Inches(10), Inches(0.5),
             "Plan de présentation du rapport", font_size=14, color=RGBColor(0xA0, 0xC4, 0xE8))

sommaire_items = [
    ("01", "Présentation de l'entreprise"),
    ("02", "Analyse de l'existant"),
    ("03", "Analyse des besoins"),
    ("04", "Méthodologie & Architecture"),
    ("05", "Modélisation"),
    ("06", "Technologies utilisées"),
    ("07", "Perspectives"),
]

for i, (num, title) in enumerate(sommaire_items):
    y = Inches(2.2) + i * Inches(0.7)
    col = ACCENT if i % 2 == 0 else MID_BLUE
    add_rounded_rect(s2, Inches(1.5), y, Inches(10), Inches(0.55), col)
    add_text_box(s2, Inches(1.8), y + Inches(0.08), Inches(0.8), Inches(0.4),
                 num, font_size=18, color=GOLD, bold=True, font_name="Calibri")
    add_text_box(s2, Inches(2.8), y + Inches(0.08), Inches(8), Inches(0.4),
                 title, font_size=16, color=WHITE, bold=False, font_name="Calibri")
slide_number(s2, 2)


# ══════════════════════════════════════════════════════════════
# SECTION 1 — PRÉSENTATION DE L'ENTREPRISE
# ══════════════════════════════════════════════════════════════
section_header_slide(prs, "Présentation de l'entreprise",
                     "Contexte et cadre du stage", "01")

s4 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s4, 0, 0, SLIDE_W, SLIDE_H, LIGHT_GRAY)
add_shape(s4, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s4, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "CONTEXTE DU STAGE", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

add_card(s4, Inches(0.5), Inches(1.6), Inches(5.8), Inches(2.6),
         "Le Projet Ecclesia Gestion",
         [
             "Application web de gestion pour églises",
             "Supporte 3 dénominations : Catholique, Protestante, Adventiste",
             "Gestion administrative, pastorale et financière",
             "Architecture moderne Full-Stack",
         ])

add_card(s4, Inches(6.8), Inches(1.6), Inches(5.8), Inches(2.6),
         "Objectifs du Stage",
         [
             "Conception et développement d'une application web",
             "Mise en pratique des connaissances acquises",
             "Contribution à un projet réel et fonctionnel",
             "Apprentissage des méthodologies Agile",
         ], icon_color=GOLD)

add_card(s4, Inches(0.5), Inches(4.5), Inches(12.1), Inches(2.5),
         "Environnement de Travail",
         [
             "Équipe de développement Full-Stack avec séparation Frontend / Backend",
             "Méthodologie Agile avec itérations successives",
             "Déploiement conteneurisé via Docker & Docker Compose",
             "Gestion de version avec Git",
         ], icon_color=MID_BLUE)
slide_number(s4, 4)


# ══════════════════════════════════════════════════════════════
# SECTION 2 — ANALYSE DE L'EXISTANT
# ══════════════════════════════════════════════════════════════
section_header_slide(prs, "Analyse de l'existant",
                     "Problèmes identifiés et problématique", "02")

# --- Slide: Problèmes ---
s6 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s6, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_shape(s6, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s6, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "PROBLÈMES IDENTIFIÉS", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

problems = [
    ("Gestion manuelle", "Les églises utilisent des registres\npapier pour suivre les membres,\nles dons et les présences"),
    ("Absence de traçabilité", "Pas de journal d'audit,\nperte de données historiques,\naucune traçabilité des actions"),
    ("Communication dispersée", "Pas de système unifié de\nnotifications ni de suivi\npastoral structuré"),
    ("Finances opaques", "Absence de contrôle budgétaire,\npas de validation financière,\nreçus non automatisés"),
]

for i, (title, desc) in enumerate(problems):
    x = Inches(0.5) + i * Inches(3.1)
    card = add_rounded_rect(s6, x, Inches(1.6), Inches(2.8), Inches(3.5), LIGHT_GRAY)
    colors = [RGBColor(0xE8, 0x4D, 0x4D), RGBColor(0xE8, 0x8A, 0x4D),
              RGBColor(0xD4, 0xA0, 0x3C), RGBColor(0x8B, 0x5C, 0xF6)]
    add_circle(s6, x + Inches(0.9), Inches(1.9), Inches(0.9), colors[i])
    add_text_box(s6, x + Inches(0.2), Inches(3.0), Inches(2.4), Inches(0.4),
                 title, font_size=14, color=NAVY, bold=True, alignment=PP_ALIGN.CENTER)
    add_text_box(s6, x + Inches(0.2), Inches(3.5), Inches(2.4), Inches(1.5),
                 desc, font_size=11, color=DARK_GRAY, alignment=PP_ALIGN.CENTER, line_spacing=1.3)

add_shape(s6, Inches(0.5), Inches(5.5), Inches(12.3), Inches(1.5), RGBColor(0xFF, 0xF3, 0xE0))
add_text_box(s6, Inches(0.8), Inches(5.6), Inches(11.5), Inches(1.3),
             "Problématique : Comment concevoir un système intégré de gestion capable d'optimiser "
             "l'administration, le suivi pastoral et la gestion financière des églises multi-dénominationnelles "
             "tout en garantissant la sécurité des données et la traçabilité des opérations ?",
             font_size=14, color=DARK_GRAY, bold=True, font_name="Calibri", line_spacing=1.4)
slide_number(s6, 6)


# ══════════════════════════════════════════════════════════════
# SECTION 3 — ANALYSE DES BESOINS
# ══════════════════════════════════════════════════════════════
section_header_slide(prs, "Analyse des besoins",
                     "Besoins fonctionnels et non fonctionnels", "03")

s8 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s8, 0, 0, SLIDE_W, SLIDE_H, LIGHT_GRAY)
add_shape(s8, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s8, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "BESOINS FONCTIONNELS", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

add_card(s8, Inches(0.5), Inches(1.6), Inches(3.8), Inches(2.8),
         "Gestion des Membres",
         [
             "Inscription et profil complet",
             "Numéros automatiques (MEM000001)",
             "Statuts : Actif, Inactif, Transféré...",
             "Transferts inter-églises avec workflow",
         ], icon_color=MID_BLUE)

add_card(s8, Inches(4.6), Inches(1.6), Inches(3.8), Inches(2.8),
         "Gestion Financière",
         [
             "Recettes, dépenses, budgets",
             "6 modes de paiement",
             "Workflow d'approbation multi-niveaux",
             "Justificatifs et pièces jointes",
         ], icon_color=ACCENT)

add_card(s8, Inches(8.7), Inches(1.6), Inches(3.8), Inches(2.8),
         "Dons & Redistributions",
         [
             "Dîmes, offrandes, fonds dédiés",
             "Génération automatique de reçus PDF",
             "Règles de redistribution (Adventiste)",
             "Envoi par email / WhatsApp",
         ], icon_color=GOLD)

add_card(s8, Inches(0.5), Inches(4.7), Inches(3.8), Inches(2.4),
         "Suivi Pastoral",
         [
             "Visites, appels, counselings",
             "Niveaux de confidentialité",
             "Planification des actions",
         ], icon_color=RGBColor(0x6B, 0x8E, 0x23))

add_card(s8, Inches(4.6), Inches(4.7), Inches(3.8), Inches(2.4),
         "Événements & Présences",
         [
             "Planification multi-types",
             "Suivi des présences par session",
             "Statistiques démographiques",
         ], icon_color=RGBColor(0x8B, 0x5C, 0xF6))

add_card(s8, Inches(8.7), Inches(4.7), Inches(3.8), Inches(2.4),
         "Hiérarchie & RBAC",
         [
             "Multi-dénomination avec validation",
             "11 rôles avec portées différentes",
             "Journal d'audit complet",
         ], icon_color=RGBColor(0xE8, 0x4D, 0x4D))
slide_number(s8, 8)


# --- Slide: Besoins Non-Fonctionnels ---
s9 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s9, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_shape(s9, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s9, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "BESOINS NON FONCTIONNELS", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

nfr_items = [
    ("Sécurité", "Authentification JWT,\nRBAC, chiffrement,\njournal d'audit immuable"),
    ("Performance", "API REST optimisée,\npagination, indexation\nPostgreSQL/PostGIS"),
    ("Scalabilité", "Architecture microservices,\nDocker, cache Redis,\nworkers Celery"),
    ("Disponibilité", "99.9% uptime,\nGunicorn + Nginx,\nsauvegardes auto"),
    ("Ergonomie", "Interface Angular Material,\nresponsive, tableaux\nde bord interactifs"),
    ("Interopérabilité", "API RESTful documentée\nSwagger, exports\nPDF/Excel"),
]

for i, (title, desc) in enumerate(nfr_items):
    col_idx = i % 3
    row_idx = i // 3
    x = Inches(0.5) + col_idx * Inches(4.2)
    y = Inches(1.6) + row_idx * Inches(2.8)
    colors_list = [ACCENT, MID_BLUE, GOLD, RGBColor(0x6B, 0x8E, 0x23),
                   RGBColor(0x8B, 0x5C, 0xF6), RGBColor(0xE8, 0x4D, 0x4D)]
    card = add_rounded_rect(s9, x, y, Inches(3.8), Inches(2.4), LIGHT_GRAY)
    add_circle(s9, x + Inches(0.2), y + Inches(0.3), Inches(0.6), colors_list[i])
    add_text_box(s9, x + Inches(1.0), y + Inches(0.35), Inches(2.5), Inches(0.4),
                 title, font_size=16, color=NAVY, bold=True)
    add_text_box(s9, x + Inches(0.3), y + Inches(1.0), Inches(3.2), Inches(1.2),
                 desc, font_size=12, color=DARK_GRAY, line_spacing=1.3)
slide_number(s9, 9)


# ══════════════════════════════════════════════════════════════
# SECTION 4 — MÉTHODOLOGIE & ARCHITECTURE
# ══════════════════════════════════════════════════════════════
section_header_slide(prs, "Méthodologie & Architecture",
                     "Approche de développement et architecture technique", "04")

# --- Slide: Méthodologie ---
s11 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s11, 0, 0, SLIDE_W, SLIDE_H, LIGHT_GRAY)
add_shape(s11, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s11, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "MÉTHODOLOGIE AGILE", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

phases = [
    ("1", "Analyse\n& Besoins", "Étude de l'existant\nRecueil des besoins\nCahier des charges"),
    ("2", "Conception\n& Design", "Modélisation UML\nMaquettes UI/UX\nArchitecture logicielle"),
    ("3", "Développement\nItératif", "Sprints Agiles\nIntégration Continue\nTests unitaires"),
    ("4", "Tests &\nValidation", "Tests d'intégration\nTests utilisateurs\nCorrections"),
    ("5", "Déploiement\n& Formation", "Mise en production\nFormation utilisateurs\nDocumentation"),
]

for i, (num, title, desc) in enumerate(phases):
    x = Inches(0.5) + i * Inches(2.5)
    y = Inches(1.8)
    add_circle(s11, x + Inches(0.7), y, Inches(0.8), ACCENT if i < 4 else GOLD)
    add_text_box(s11, x + Inches(0.7), y + Inches(0.12), Inches(0.8), Inches(0.6),
                 num, font_size=24, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER)
    add_text_box(s11, x + Inches(0.1), y + Inches(1.0), Inches(2.2), Inches(0.7),
                 title, font_size=14, color=NAVY, bold=True, alignment=PP_ALIGN.CENTER)
    add_text_box(s11, x + Inches(0.1), y + Inches(1.8), Inches(2.2), Inches(1.5),
                 desc, font_size=11, color=DARK_GRAY, alignment=PP_ALIGN.CENTER, line_spacing=1.4)
    if i < len(phases) - 1:
        add_shape(s11, x + Inches(2.1), y + Inches(0.3), Inches(0.3), Inches(0.04), ACCENT)

add_shape(s11, Inches(0.5), Inches(5.3), Inches(12.3), Inches(1.8), RGBColor(0xE3, 0xF2, 0xFD))
add_text_box(s11, Inches(0.8), Inches(5.4), Inches(11.5), Inches(1.6),
             "Approche itérative et incrémentale permettant une adaptation continue aux besoins "
             "du client. Chaque sprint produit un incrément fonctionnel testé et validé.",
             font_size=14, color=DARK_GRAY, font_name="Calibri", line_spacing=1.5)
slide_number(s11, 11)


# --- Slide: Architecture Technique ---
s12 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s12, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_shape(s12, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s12, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "ARCHITECTURE TECHNIQUE", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

# Frontend block
add_rounded_rect(s12, Inches(0.5), Inches(1.6), Inches(3.5), Inches(5.2), RGBColor(0xE3, 0xF2, 0xFD))
add_text_box(s12, Inches(0.5), Inches(1.65), Inches(3.5), Inches(0.5),
             "  FRONTEND", font_size=16, color=ACCENT, bold=True, alignment=PP_ALIGN.CENTER)
add_multi_text(s12, Inches(0.7), Inches(2.2), Inches(3.1), Inches(4.5), [
    "Angular 19 (TypeScript)",
    "Angular Material (UI)",
    "SCSS / CSS",
    "Chart.js + ng2-charts",
    "Leaflet (Cartes GPS)",
    "JWT Interceptor",
    "Routing Guards",
    "Services Angular",
], font_size=12, color=DARK_GRAY, bullet=True)

# API block
add_rounded_rect(s12, Inches(4.5), Inches(1.6), Inches(4.0), Inches(5.2), RGBColor(0xFE, 0xF3, 0xE2))
add_text_box(s12, Inches(4.5), Inches(1.65), Inches(4.0), Inches(0.5),
             "  API / BACKEND", font_size=16, color=GOLD, bold=True, alignment=PP_ALIGN.CENTER)
add_multi_text(s12, Inches(4.7), Inches(2.2), Inches(3.6), Inches(4.5), [
    "Django 5.2 + DRF",
    "JWT Auth (Simple JWT)",
    "17 Applications Django",
    "drf-spectacular (Swagger)",
    "Django Channels (WebSocket)",
    "Celery + Redis (Async Tasks)",
    "ReportLab (PDF)",
    "openpyxl (Excel)",
], font_size=12, color=DARK_GRAY, bullet=True)

# Database block
add_rounded_rect(s12, Inches(9.0), Inches(1.6), Inches(3.8), Inches(5.2), RGBColor(0xE8, 0xF5, 0xE9))
add_text_box(s12, Inches(9.0), Inches(1.65), Inches(3.8), Inches(0.5),
             "  BASE DE DONNÉES", font_size=16, color=RGBColor(0x2E, 0x7D, 0x32), bold=True,
             alignment=PP_ALIGN.CENTER)
add_multi_text(s12, Inches(9.2), Inches(2.2), Inches(3.4), Inches(4.5), [
    "PostgreSQL 16",
    "PostGIS 3.4 (Géospatial)",
    "17 modèles de données",
    "Soft Delete (suppression douce)",
    "Audit Trail immuable",
    "Relations hiérarchiques",
    "Index optimisés",
    "UUID & séquences auto",
], font_size=12, color=DARK_GRAY, bullet=True)
slide_number(s12, 12)


# ══════════════════════════════════════════════════════════════
# SECTION 5 — MODÉLISATION
# ══════════════════════════════════════════════════════════════
section_header_slide(prs, "Modélisation",
                     "Modèles de données et structure applicative", "05")

s14 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s14, 0, 0, SLIDE_W, SLIDE_H, LIGHT_GRAY)
add_shape(s14, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s14, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "MODÈLES PRINCIPAUX", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

models = [
    ("Membre", "Numéro auto, statut, baptême,\ntransferts, contacts urgence,\nappartenance familiale"),
    ("Entité Hiérarchique", "Arbre multi-dénomination,\n10 types d'entités, validation\nde parenté strict"),
    ("Don / Dîme", "7 statuts, reçus PDF,\nredistribution automatique,\n6 modes de paiement"),
    ("Finance", "Recettes, dépenses, budgets,\njustificatifs, validation\nmulti-niveaux"),
    ("Session Culte", "Présences individuelles,\ncomptage démographique,\n6 types de service"),
    ("Suivi Pastoral", "Actions, confidentialité,\nplanification, historique\net clôture"),
    ("Département", "Types de ministères,\nplans annuels, budget,\nmembres affectés"),
    ("Événement", "8 types, participants,\nstatuts, budgets prévus\nvs réels"),
]

for i, (name, desc) in enumerate(models):
    col = i % 4
    row = i // 4
    x = Inches(0.5) + col * Inches(3.15)
    y = Inches(1.6) + row * Inches(2.8)
    colors_m = [MID_BLUE, ACCENT, GOLD, RGBColor(0x6B, 0x8E, 0x23),
                RGBColor(0x8B, 0x5C, 0xF6), RGBColor(0xE8, 0x4D, 0x4D),
                RGBColor(0x00, 0x89, 0x7B), RGBColor(0xE8, 0x8A, 0x4D)]
    card = add_rounded_rect(s14, x, y, Inches(2.9), Inches(2.4), WHITE)
    add_shape(s14, x, y, Inches(2.9), Inches(0.06), colors_m[i])
    add_text_box(s14, x + Inches(0.2), y + Inches(0.2), Inches(2.5), Inches(0.4),
                 name, font_size=15, color=NAVY, bold=True)
    add_text_box(s14, x + Inches(0.2), y + Inches(0.7), Inches(2.5), Inches(1.5),
                 desc, font_size=11, color=DARK_GRAY, line_spacing=1.3)
slide_number(s14, 14)


# --- Slide: Modélisation Hiérarchique ---
s15 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s15, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_shape(s15, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s15, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "HIÉRARCHIE PAR DÉNOMINATION", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

# Adventist
add_rounded_rect(s15, Inches(0.5), Inches(1.6), Inches(3.8), Inches(5.2), RGBColor(0xE3, 0xF2, 0xFD))
add_text_box(s15, Inches(0.5), Inches(1.7), Inches(3.8), Inches(0.5),
             "  ADVENTISTE", font_size=16, color=MID_BLUE, bold=True, alignment=PP_ALIGN.CENTER)
adv_items = [
    "Conférence Générale",
    "Division",
    "Union",
    "Fédération",
    "Mission",
    "Église Locale",
    "Chapelle",
]
for i, item in enumerate(adv_items):
    y_pos = Inches(2.3) + i * Inches(0.55)
    shade = RGBColor(0xBB, 0xDE, 0xFB) if i % 2 == 0 else RGBColor(0xE3, 0xF2, 0xFD)
    add_rounded_rect(s15, Inches(0.8), y_pos, Inches(3.2), Inches(0.45), shade)
    add_text_box(s15, Inches(1.0), y_pos + Inches(0.05), Inches(2.8), Inches(0.35),
                 f"{'  ▸ ' * (i+1)}{item}", font_size=11, color=DARK_GRAY)

# Catholic
add_rounded_rect(s15, Inches(4.7), Inches(1.6), Inches(3.8), Inches(5.2), RGBColor(0xFE, 0xF3, 0xE2))
add_text_box(s15, Inches(4.7), Inches(1.7), Inches(3.8), Inches(0.5),
             "  CATHOLIQUE", font_size=16, color=GOLD, bold=True, alignment=PP_ALIGN.CENTER)
cat_items = ["Diocèse", "Paroisse", "Chapelle"]
for i, item in enumerate(cat_items):
    y_pos = Inches(2.3) + i * Inches(0.8)
    shade = RGBColor(0xFF, 0xF8, 0xE1) if i % 2 == 0 else RGBColor(0xFE, 0xF3, 0xE2)
    add_rounded_rect(s15, Inches(5.0), y_pos, Inches(3.2), Inches(0.6), shade)
    add_text_box(s15, Inches(5.2), y_pos + Inches(0.1), Inches(2.8), Inches(0.4),
                 f"{'  ▸ ' * (i+1)}{item}", font_size=12, color=DARK_GRAY)

# Protestant
add_rounded_rect(s15, Inches(8.9), Inches(1.6), Inches(3.8), Inches(5.2), RGBColor(0xE8, 0xF5, 0xE9))
add_text_box(s15, Inches(8.9), Inches(1.7), Inches(3.8), Inches(0.5),
             "  PROTESTANT", font_size=16, color=RGBColor(0x2E, 0x7D, 0x32), bold=True,
             alignment=PP_ALIGN.CENTER)
prot_items = ["Union Protestante", "Église Protestante", "Chapelle"]
for i, item in enumerate(prot_items):
    y_pos = Inches(2.3) + i * Inches(0.8)
    shade = RGBColor(0xC8, 0xE6, 0xC9) if i % 2 == 0 else RGBColor(0xE8, 0xF5, 0xE9)
    add_rounded_rect(s15, Inches(9.2), y_pos, Inches(3.2), Inches(0.6), shade)
    add_text_box(s15, Inches(9.4), y_pos + Inches(0.1), Inches(2.8), Inches(0.4),
                 f"{'  ▸ ' * (i+1)}{item}", font_size=12, color=DARK_GRAY)
slide_number(s15, 15)


# ══════════════════════════════════════════════════════════════
# SECTION 6 — TECHNOLOGIES UTILISÉES
# ══════════════════════════════════════════════════════════════
section_header_slide(prs, "Technologies utilisées",
                     "Stack technique complète", "06")

s17 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s17, 0, 0, SLIDE_W, SLIDE_H, LIGHT_GRAY)
add_shape(s17, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s17, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "STACK TECHNIQUE", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

techs = [
    ("Backend", "Django 5.2\nDjango REST Framework\nJWT Authentication\nDjango Channels", MID_BLUE),
    ("Frontend", "Angular 19\nAngular Material\nTypeScript\nSCSS", ACCENT),
    ("Base de Données", "PostgreSQL 16\nPostGIS 3.4\nPostGIS Géospatial\nRedis", RGBColor(0x2E, 0x7D, 0x32)),
    ("Déploiement", "Docker & Compose\nGunicorn\nNginx\nWhiteNoise", RGBColor(0xE8, 0x8A, 0x4D)),
    ("Async & Tasks", "Celery\nRedis Broker\nWebSocket (Daphne)\nTâches différées", RGBColor(0x8B, 0x5C, 0xF6)),
    ("Reporting", "ReportLab (PDF)\nopenpyxl (Excel)\ndrf-spectacular\nSwagger/OpenAPI", GOLD),
    ("Sécurité", "RBAC (11 rôles)\nJWT Token\nBlacklisting\nAudit Trail", RGBColor(0xE8, 0x4D, 0x4D)),
    ("Cartes & UI", "Leaflet (GPS)\nChart.js\nng2-charts\nAngular Material", RGBColor(0x00, 0x89, 0x7B)),
]

for i, (cat, items, color) in enumerate(techs):
    col = i % 4
    row = i // 4
    x = Inches(0.5) + col * Inches(3.15)
    y = Inches(1.6) + row * Inches(2.8)
    card = add_rounded_rect(s17, x, y, Inches(2.9), Inches(2.4), WHITE)
    add_shape(s17, x, y, Inches(0.08), Inches(2.4), color)
    add_text_box(s17, x + Inches(0.3), y + Inches(0.15), Inches(2.4), Inches(0.4),
                 cat, font_size=14, color=NAVY, bold=True)
    add_multi_text(s17, x + Inches(0.3), y + Inches(0.6), Inches(2.4), Inches(1.6),
                   items.split("\n"), font_size=11, color=DARK_GRAY, bullet=True)
slide_number(s17, 17)


# ══════════════════════════════════════════════════════════════
# SECTION 7 — PERSPECTIVES
# ══════════════════════════════════════════════════════════════
section_header_slide(prs, "Perspectives",
                     "Améliorations futures et axes de développement", "07")

s19 = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s19, 0, 0, SLIDE_W, SLIDE_H, WHITE)
add_shape(s19, 0, 0, SLIDE_W, Inches(1.2), NAVY)
add_text_box(s19, Inches(0.8), Inches(0.3), Inches(10), Inches(0.7),
             "AXES D'AMÉLIORATION", font_size=28, color=WHITE, bold=True, font_name="Calibri Light")

perspectives = [
    ("Application Mobile", "Développer une application\nmobile (React Native / Flutter)\npour un accès sur tablette\net smartphone"),
    ("Intelligence Artificielle", "Prédiction de l'assistance,\nanalyse des dons,\nrecommandations pastorales\nbasées sur l'IA"),
    ("Paiements Mobile Money", "Intégration de M-Pesa,\nOrange Money, Airtel Money\npour les dons et cotisations\nen ligne"),
    ("Multilingue", "Support du Français,\nAnglais, Lingala et autres\nlangues locales pour\nl'expansion internationale"),
    ("Reporting Avancé", "Tableaux de bord interactifs,\nexports personnalisés,\nscores pastoraux,\nbenchmark inter-églises"),
    ("Microservices", "Migration vers une\narchitecture microservices\npour une meilleure\nscalabilité et maintenabilité"),
]

for i, (title, desc) in enumerate(perspectives):
    col = i % 3
    row = i // 3
    x = Inches(0.5) + col * Inches(4.2)
    y = Inches(1.6) + row * Inches(2.8)
    colors_p = [ACCENT, RGBColor(0x8B, 0x5C, 0xF6), RGBColor(0x2E, 0x7D, 0x32),
                GOLD, RGBColor(0xE8, 0x4D, 0x4D), RGBColor(0x00, 0x89, 0x7B)]
    card = add_rounded_rect(s19, x, y, Inches(3.8), Inches(2.4), LIGHT_GRAY)
    add_circle(s19, x + Inches(0.2), y + Inches(0.2), Inches(0.5), colors_p[i])
    add_text_box(s19, x + Inches(0.9), y + Inches(0.25), Inches(2.6), Inches(0.4),
                 title, font_size=14, color=NAVY, bold=True)
    add_text_box(s19, x + Inches(0.2), y + Inches(0.9), Inches(3.4), Inches(1.3),
                 desc, font_size=11, color=DARK_GRAY, line_spacing=1.4)
slide_number(s19, 19)


# ══════════════════════════════════════════════════════════════
# SLIDE FINALE — REMERCIEMENTS
# ══════════════════════════════════════════════════════════════
s_final = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(s_final, 0, 0, SLIDE_W, SLIDE_H, NAVY)
add_shape(s_final, 0, SLIDE_H - Inches(0.1), SLIDE_W, Inches(0.1), GOLD)

add_circle(s_final, Inches(10.0), Inches(0.3), Inches(3.0), DARK_BLUE)
add_circle(s_final, Inches(0.5), Inches(5.0), Inches(2.0), DARK_BLUE)

add_text_box(s_final, Inches(1.5), Inches(2.0), Inches(10), Inches(1.5),
             "Merci", font_size=64, color=WHITE, bold=True,
             font_name="Calibri Light", alignment=PP_ALIGN.CENTER)
add_shape(s_final, Inches(5.5), Inches(3.5), Inches(2.3), Inches(0.05), GOLD)
add_text_box(s_final, Inches(2.0), Inches(3.8), Inches(9), Inches(0.6),
             "Questions & Discussion", font_size=22, color=RGBColor(0xA0, 0xC4, 0xE8),
             font_name="Calibri Light", alignment=PP_ALIGN.CENTER)
add_text_box(s_final, Inches(2.0), Inches(4.8), Inches(9), Inches(0.5),
             "Lindsay Sarah  •  Ecclesia Gestion  •  2025-2026", font_size=14,
             color=MED_GRAY, alignment=PP_ALIGN.CENTER)
slide_number(s_final, 20)


# ─── SAVE ─────────────────────────────────────────────────────
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "Ecclesia_Gestion_Rapport_Stage.pptx")
prs.save(output_path)
print("Presentation sauvegardee : " + output_path)
print("Nombre de diapositives : " + str(len(prs.slides)))
