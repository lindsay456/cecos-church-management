"""Generateur de recu de don PDF - style CECOS Church Management."""
from __future__ import annotations

import io
from datetime import datetime


def generate_donation_receipt_pdf(receipt, don):
    """Genere un PDF de recu de don professionnel et elegant."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm, cm
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
        HRFlowable, KeepTogether
    )

    width, height = A4
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'ReceiptTitle', parent=styles['Title'],
        fontSize=22, textColor=colors.HexColor("#0d9488"),
        spaceAfter=6, alignment=TA_LEFT, fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'Subtitle', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor("#6b7280"),
        spaceAfter=2, fontName='Helvetica'
    )
    heading_style = ParagraphStyle(
        'SectionHeading', parent=styles['Normal'],
        fontSize=11, textColor=colors.HexColor("#374151"),
        spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold'
    )
    normal_style = ParagraphStyle(
        'NormalText', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor("#374151"),
        fontName='Helvetica', leading=14
    )
    label_style = ParagraphStyle(
        'Label', parent=styles['Normal'],
        fontSize=9, textColor=colors.HexColor("#9ca3af"),
        fontName='Helvetica'
    )
    value_style = ParagraphStyle(
        'Value', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor("#111827"),
        fontName='Helvetica-Bold'
    )
    amount_style = ParagraphStyle(
        'Amount', parent=styles['Normal'],
        fontSize=28, textColor=colors.HexColor("#0d9488"),
        fontName='Helvetica-Bold', alignment=TA_CENTER
    )
    center_style = ParagraphStyle(
        'Center', parent=styles['Normal'],
        fontSize=9, textColor=colors.HexColor("#9ca3af"),
        alignment=TA_CENTER, fontName='Helvetica'
    )
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, textColor=colors.HexColor("#9ca3af"),
        alignment=TA_CENTER, fontName='Helvetica', leading=12
    )

    elements = []

    # === HEADER ===
    header_data = [
        [
            Paragraph("Recu Officiel de Don", title_style),
            Paragraph(f"N\u00b0 REC-{receipt.receipt_number}", ParagraphStyle(
                'ReceiptNum', parent=styles['Normal'],
                fontSize=10, textColor=colors.HexColor("#6b7280"),
                alignment=TA_RIGHT, fontName='Helvetica'
            )),
        ],
        [
            Paragraph("CECOS Church Management", subtitle_style),
            Paragraph(f"Date d'emission : {receipt.issued_at.strftime('%d %B %Y')}", ParagraphStyle(
                'DateEmission', parent=styles['Normal'],
                fontSize=9, textColor=colors.HexColor("#9ca3af"),
                alignment=TA_RIGHT, fontName='Helvetica'
            )),
        ],
    ]
    header_table = Table(header_data, colWidths=[width*0.55, width*0.35])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0d9488")))
    elements.append(Spacer(1, 16))

    # === EMETTEUR + DONATEUR (two columns) ===
    church_name = don.church.name if don.church else "Eglise"
    member_name = don.member.full_name if don.member else "Donateur anonyme"
    member_number = don.member.member_number if don.member else "-"

    left_col = []
    left_col.append(Paragraph("EMETTEUR", heading_style))
    left_col.append(Paragraph(f"<b>{church_name}</b>", normal_style))
    left_col.append(Spacer(1, 4))

    left_col.append(Paragraph("DONATEUR", heading_style))
    left_col.append(Paragraph(f"<b>{member_name}</b>", normal_style))
    left_col.append(Paragraph(f"Identifiant : {member_number}", subtitle_style))
    left_col.append(Spacer(1, 4))

    # Details section
    right_col = []
    right_col.append(Paragraph("DETAILS DE LA TRANSACTION", heading_style))

    detail_data = [
        ["Type de Don", don.get_donation_type_display()],
        ["Mode de Paiement", don.get_payment_method_display() if hasattr(don, 'get_payment_method_display') else "-"],
        ["Date", str(don.donation_date)],
        ["Reference", don.donation_number],
    ]
    detail_table = Table(detail_data, colWidths=[120, 180])
    detail_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor("#6b7280")),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor("#111827")),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, colors.HexColor("#f3f4f6")),
    ]))
    right_col.append(detail_table)

    # Two-column layout
    content_data = [[left_col, right_col]]
    content_table = Table(content_data, colWidths=[width*0.45, width*0.45])
    content_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(content_table)
    elements.append(Spacer(1, 20))

    # === MONTANT TOTAL (highlighted box) ===
    amount_data = [
        [Paragraph("MONTANT TOTAL", ParagraphStyle(
            'AmtLabel', parent=styles['Normal'],
            fontSize=10, textColor=colors.HexColor("#0d9488"),
            alignment=TA_CENTER, fontName='Helvetica-Bold'
        ))],
        [Paragraph(f"{don.amount:,.0f} FCFA", amount_style)],
    ]
    amount_table = Table(amount_data, colWidths=[width*0.5])
    amount_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f0fdfa")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#0d9488")),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    # Center the amount table
    wrapper = Table([[amount_table]], colWidths=[width*0.5])
    wrapper.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
    ]))
    elements.append(wrapper)
    elements.append(Spacer(1, 24))

    # === SCEAU ===
    seal_data = [
        [Paragraph("SCEAU ELECTRONIQUE", ParagraphStyle(
            'SealLabel', parent=styles['Normal'],
            fontSize=8, textColor=colors.HexColor("#9ca3af"),
            alignment=TA_CENTER, fontName='Helvetica'
        ))],
        [Paragraph("CECOS", ParagraphStyle(
            'SealName', parent=styles['Normal'],
            fontSize=10, textColor=colors.HexColor("#0d9488"),
            alignment=TA_CENTER, fontName='Helvetica-Bold'
        ))],
    ]
    seal_table = Table(seal_data, colWidths=[100])
    seal_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#d1d5db")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    seal_wrapper = Table([[seal_table]], colWidths=[width])
    seal_wrapper.setStyle(TableStyle([('ALIGN', (0, 0), (0, 0), 'CENTER')]))
    elements.append(seal_wrapper)
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("Certifie conforme par le systeme de gestion CECOS", center_style))
    elements.append(Spacer(1, 20))

    # === FOOTER ===
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb")))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f"Cecos Church Management &copy; {datetime.now().year}. Tous droits reserves. "
        f"Ce recu atteste de la validation de votre don.",
        footer_style
    ))
    elements.append(Paragraph(
        f"FIN DU DOCUMENT — {receipt.receipt_number}",
        ParagraphStyle('EndDoc', parent=styles['Normal'],
            fontSize=8, textColor=colors.HexColor("#d1d5db"),
            alignment=TA_CENTER, fontName='Helvetica', spaceBefore=8)
    ))

    doc.build(elements)
    buf.seek(0)
    return buf
