import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfExportService {

  exportTableToPdf(title: string, headers: string[], rows: any[][], filename: string) {
    const lines: string[] = [];
    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] || '').length));
      return Math.min(maxLen + 2, 30);
    });

    lines.push('='.repeat(colWidths.reduce((a, b) => a + b + 3, 0)));
    lines.push(`  ${title}`);
    lines.push('='.repeat(colWidths.reduce((a, b) => a + b + 3, 0)));
    lines.push('');

    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ');
    lines.push(headerLine);
    lines.push('-'.repeat(headerLine.length));

    rows.forEach(row => {
      const line = row.map((c, i) => String(c || '').padEnd(colWidths[i])).join(' | ');
      lines.push(line);
    });

    lines.push('-'.repeat(headerLine.length));
    lines.push(`Total: ${rows.length} enregistrements`);
    lines.push(`Exporte le: ${new Date().toLocaleString('fr-FR')}`);

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  exportHtmlToPdf(title: string, htmlContent: string, filename: string) {
    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #111827; }
    .subtitle { font-size: 13px; color: #6B7280; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #F3F4F6; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase; border-bottom: 2px solid #E5E7EB; }
    td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #374151; }
    tr:hover td { background: #F9FAFB; }
    .footer { margin-top: 24px; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 12px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="subtitle">Cecos Church Management &mdash; Exporte le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  ${htmlContent}
  <div class="footer">Cecos Church Management &copy; ${new Date().getFullYear()} &mdash; Document genere automatiquement</div>
</body>
</html>`;
    const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  exportFinanceToPdf(data: { income: number; expenses: number; tithes: number; offerings: number; budget: number }) {
    const html = `
      <table>
        <tr><th>Poste</th><th>Montant (FCFA)</th></tr>
        <tr><td>Recettes</td><td><strong>${data.income.toLocaleString('fr-FR')}</strong></td></tr>
        <tr><td>Depenses</td><td><strong>${data.expenses.toLocaleString('fr-FR')}</strong></td></tr>
        <tr><td>Balance</td><td><strong>${(data.income - data.expenses).toLocaleString('fr-FR')}</strong></td></tr>
        <tr><td colspan="2" style="border-top: 2px solid #E5E7EB;"></td></tr>
        <tr><td>Dimes recus</td><td>${data.tithes.toLocaleString('fr-FR')}</td></tr>
        <tr><td>Offrandes recues</td><td>${data.offerings.toLocaleString('fr-FR')}</td></tr>
        <tr><td>Budget consomme</td><td>${data.budget}%</td></tr>
      </table>
    `;
    this.exportHtmlToPdf('Rapport Financier', html, 'rapport-financier');
  }

  exportAttendanceToPdf(rows: any[][]) {
    const headers = ['Date', 'Type', 'Chapelle', 'H', 'F', 'E', 'V', 'Total'];
    const html = `
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    `;
    this.exportHtmlToPdf('Rapport de Presences', html, 'rapport-presences');
  }

  exportMembersToPdf(rows: any[][]) {
    const headers = ['Nom', 'Prenom', 'Genre', 'Statut', 'Role'];
    const html = `
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    `;
    this.exportHtmlToPdf('Rapport des Membres', html, 'rapport-membres');
  }
}
