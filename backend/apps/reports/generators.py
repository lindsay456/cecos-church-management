"""Generateurs de rapports PDF - Style CECOS Church Management.

Tous les rapports utilisent un design cohérent avec:
- En-tête avec logo/titre CECOS en teal (#0d9488)
- Sous-titre date d'export
- Tableaux stylises avec couleurs pastel
- Pied de page professionnel
"""
from __future__ import annotations

import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
    HRFlowable, PageBreak
)

# === SHARED STYLES ===
TEAL = colors.HexColor("#0d9488")
TEAL_LIGHT = colors.HexColor("#f0fdfa")
DARK = colors.HexColor("#111827")
GRAY = colors.HexColor("#6b7280")
LIGHT_GRAY = colors.HexColor("#f9fafb")
BORDER = colors.HexColor("#e5e7eb")
WHITE = colors.white


def _get_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('CecosTitle', fontSize=18, textColor=TEAL,
        spaceAfter=4, fontName='Helvetica-Bold', leading=22))
    styles.add(ParagraphStyle('CecosSubtitle', fontSize=10, textColor=GRAY,
        spaceAfter=2, fontName='Helvetica'))
    styles.add(ParagraphStyle('CecosSection', fontSize=12, textColor=DARK,
        spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle('CecosFooter', fontSize=8, textColor=GRAY,
        alignment=TA_CENTER, fontName='Helvetica', leading=11))
    styles.add(ParagraphStyle('CecosCenter', fontSize=9, textColor=GRAY,
        alignment=TA_CENTER, fontName='Helvetica'))
    return styles


def _build_header(title, subtitle, elements, styles):
    """Construit l'en-tete commun a tous les rapports."""
    now = datetime.now()
    header_data = [
        [Paragraph(title, styles['CecosTitle']),
         Paragraph(f"Export : {now.strftime('%d/%m/%Y %H:%M')}", styles['CecosSubtitle'])],
        [Paragraph("CECOS Church Management", styles['CecosSubtitle']),
         Paragraph(subtitle, styles['CecosSubtitle'])],
    ]
    ht = Table(header_data, colWidths=[340, 180])
    ht.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    elements.append(ht)
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", thickness=2, color=TEAL))
    elements.append(Spacer(1, 14))


def _build_footer(elements, styles, count):
    """Construit le pied de page commun."""
    elements.append(Spacer(1, 16))
    elements.append(HRFlowable(width="100%", thickness=1, color=BORDER))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(
        f"Cecos Church Management &copy; {datetime.now().year} — {count} enregistrement(s) — "
        f"Document genere automatiquement", styles['CecosFooter']))


def _table_style(header_color):
    """Retourne le style de tableau avec header colore et rangees alternees."""
    return TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, header_color),
        ('LINEBELOW', (0, -1), (-1, -1), 1, BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ])


def _doc_template(buf):
    return SimpleDocTemplate(buf, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)


# === REPORT GENERATORS ===

def generate_members_pdf(church=None, queryset=None):
    buf = io.BytesIO()
    doc = _doc_template(buf)
    styles = _get_styles()
    elements = []

    if queryset is None:
        from apps.members.models import Membre
        queryset = Membre.objects.filter(is_active=True)
        if church:
            queryset = queryset.filter(church=church)

    count = queryset.count()
    _build_header("Rapport des Membres", f"{count} membre(s) actif(s)", elements, styles)

    data = [["N°", "Nom complet", "Telephone", "Email", "Genre", "Statut"]]
    for m in queryset[:500]:
        data.append([
            m.member_number, m.full_name, m.phone or "-",
            m.email or "-", m.get_gender_display() if hasattr(m, 'get_gender_display') else m.gender,
            m.get_status_display()
        ])

    table = Table(data, colWidths=[65, 120, 85, 120, 50, 70])
    table.setStyle(_table_style(TEAL))
    elements.append(table)
    _build_footer(elements, styles, count)

    doc.build(elements)
    buf.seek(0)
    return buf


def generate_donations_pdf(church=None, queryset=None):
    buf = io.BytesIO()
    doc = _doc_template(buf)
    styles = _get_styles()
    elements = []

    if queryset is None:
        from apps.donations.models import Don
        queryset = Don.objects.filter(status="VALIDATED").select_related("member", "church")
        if church:
            queryset = queryset.filter(church=church)

    count = queryset.count()
    total = sum(d.amount for d in queryset)
    _build_header("Rapport des Dimes et Offrandes", f"{count} don(s) — Total : {total:,.0f} FCFA", elements, styles)

    # Summary box
    summary_data = [
        [Paragraph("<b>Total general</b>", styles['CecosCenter']),
         Paragraph(f"<b>{total:,.0f} FCFA</b>", styles['CecosCenter'])],
    ]
    st = Table(summary_data, colWidths=[260])
    st.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), TEAL_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, TEAL),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    sw = Table([[st]], colWidths=[520])
    sw.setStyle(TableStyle([('ALIGN', (0, 0), (0, 0), 'CENTER')]))
    elements.append(sw)
    elements.append(Spacer(1, 14))

    data = [["N°", "Membre", "Type", "Montant (FCFA)", "Date", "Statut"]]
    for d in queryset[:500]:
        data.append([
            d.donation_number,
            d.member.full_name if d.member else "Anonyme",
            d.get_donation_type_display(),
            f"{d.amount:,.0f}",
            str(d.donation_date),
            d.get_status_display(),
        ])

    table = Table(data, colWidths=[65, 110, 95, 85, 70, 80])
    table.setStyle(_table_style(colors.HexColor("#166534")))
    elements.append(table)
    _build_footer(elements, styles, count)

    doc.build(elements)
    buf.seek(0)
    return buf


def generate_financial_pdf(recettes=None, depenses=None):
    buf = io.BytesIO()
    doc = _doc_template(buf)
    styles = _get_styles()
    elements = []

    total_recettes = sum(r.amount for r in recettes) if recettes else 0
    total_depenses = sum(d.amount for d in depenses) if depenses else 0
    solde = total_recettes - total_depenses

    _build_header("Rapport Financier", f"Solde : {solde:,.0f} FCFA", elements, styles)

    # Summary boxes
    box_data = [
        [Paragraph("<b>Recettes</b>", styles['CecosCenter']),
         Paragraph("<b>Depenses</b>", styles['CecosCenter']),
         Paragraph("<b>Solde</b>", styles['CecosCenter'])],
        [Paragraph(f"{total_recettes:,.0f} FCFA", styles['CecosCenter']),
         Paragraph(f"{total_depenses:,.0f} FCFA", styles['CecosCenter']),
         Paragraph(f"{solde:,.0f} FCFA", styles['CecosCenter'])],
    ]
    bt = Table(box_data, colWidths=[170, 170, 170])
    bt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f0fdf4")),
        ('BACKGROUND', (1, 0), (1, -1), colors.HexColor("#fef2f2")),
        ('BACKGROUND', (2, 0), (2, -1), TEAL_LIGHT),
        ('BOX', (0, 0), (0, -1), 1, colors.HexColor("#166534")),
        ('BOX', (1, 0), (1, -1), 1, colors.HexColor("#dc2626")),
        ('BOX', (2, 0), (2, -1), 1, TEAL),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, BORDER),
    ]))
    elements.append(bt)
    elements.append(Spacer(1, 16))

    if recettes and recettes.exists():
        elements.append(Paragraph("Recettes", styles['CecosSection']))
        data = [["Categorie", "Montant (FCFA)", "Date", "Source"]]
        for r in recettes[:200]:
            data.append([r.category.name, f"{r.amount:,.0f}", str(r.date), r.source or "-"])
        t = Table(data, colWidths=[130, 100, 80, 200])
        t.setStyle(_table_style(colors.HexColor("#166534")))
        elements.append(t)
        elements.append(Spacer(1, 14))

    if depenses and depenses.exists():
        elements.append(Paragraph("Depenses", styles['CecosSection']))
        data = [["Categorie", "Montant (FCFA)", "Date", "Beneficiaire"]]
        for d in depenses[:200]:
            data.append([d.category.name, f"{d.amount:,.0f}", str(d.date), d.beneficiary or "-"])
        t = Table(data, colWidths=[130, 100, 80, 200])
        t.setStyle(_table_style(colors.HexColor("#dc2626")))
        elements.append(t)

    _build_footer(elements, styles, (recettes.count() if recettes else 0) + (depenses.count() if depenses else 0))
    doc.build(elements)
    buf.seek(0)
    return buf


def generate_attendance_pdf(queryset=None):
    buf = io.BytesIO()
    doc = _doc_template(buf)
    styles = _get_styles()
    elements = []

    if queryset is None:
        from apps.attendance.models import SessionCulte
        queryset = SessionCulte.objects.select_related("church", "chapel").order_by("-date")

    count = queryset.count()
    _build_header("Rapport de Presences", f"{count} session(s) de culte", elements, styles)

    data = [["Date", "Culte", "Chapelle", "H", "F", "E", "V", "Total"]]
    for s in queryset[:500]:
        data.append([
            str(s.date), s.get_service_type_display(),
            s.chapel.name if s.chapel else "-",
            s.men_count, s.women_count, s.children_count, s.visitors_count,
            s.total_count,
        ])

    table = Table(data, colWidths=[62, 68, 110, 32, 32, 32, 32, 42])
    table.setStyle(_table_style(colors.HexColor("#c2410c")))
    elements.append(table)
    _build_footer(elements, styles, count)

    doc.build(elements)
    buf.seek(0)
    return buf


def generate_pastoral_pdf(queryset=None):
    buf = io.BytesIO()
    doc = _doc_template(buf)
    styles = _get_styles()
    elements = []

    if queryset is None:
        from apps.pastoral.models import SuiviPastoral
        queryset = SuiviPastoral.objects.select_related("member", "assigned_to", "church").order_by("-action_date")

    count = queryset.count()
    _build_header("Rapport du Suivi Pastoral", f"{count} suivi(s)", elements, styles)

    data = [["Membre", "Motif", "Assigne a", "Statut", "Date"]]
    for s in queryset[:500]:
        data.append([
            s.member.full_name if s.member else "-",
            (s.reason[:40] + "...") if s.reason and len(s.reason) > 40 else (s.reason or "-"),
            s.assigned_to.full_name if s.assigned_to else "-",
            s.get_status_display(),
            str(s.action_date),
        ])

    table = Table(data, colWidths=[100, 140, 100, 80, 70])
    table.setStyle(_table_style(colors.HexColor("#7c3aed")))
    elements.append(table)
    _build_footer(elements, styles, count)

    doc.build(elements)
    buf.seek(0)
    return buf


def generate_audit_pdf(queryset=None):
    buf = io.BytesIO()
    doc = _doc_template(buf)
    styles = _get_styles()
    elements = []

    if queryset is None:
        from apps.audit.models import JournalAudit
        queryset = JournalAudit.objects.select_related("user").order_by("-created_at")

    count = min(queryset.count(), 500)
    _build_header("Journal d'Audit", f"{count} evenement(s)", elements, styles)

    data = [["Date", "Action", "Utilisateur", "Modele", "Objet"]]
    for log in queryset[:500]:
        data.append([
            str(log.created_at.strftime("%d/%m/%Y %H:%M")),
            log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
            log.user.email if log.user else "-",
            f"{log.app_label}.{log.model_name}",
            str(log.object_id or "-"),
        ])

    table = Table(data, colWidths=[95, 80, 120, 105, 55])
    table.setStyle(_table_style(colors.HexColor("#374151")))
    elements.append(table)
    _build_footer(elements, styles, count)

    doc.build(elements)
    buf.seek(0)
    return buf


def generate_report_excel(title, headers, rows):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment

    wb = Workbook()
    ws = wb.active
    ws.title = title[:31]

    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="0d9488", end_color="0d9488", fill_type="solid")

    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    for row_idx, row_data in enumerate(rows, 2):
        for col_idx, value in enumerate(row_data, 1):
            ws.cell(row=row_idx, column=col_idx, value=value)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf
