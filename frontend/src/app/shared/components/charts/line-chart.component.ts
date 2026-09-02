import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #canvas></canvas>
      <div class="chart-legend" *ngIf="series.length">
        <span class="legend-item" *ngFor="let s of series; let i = index">
          <span class="legend-dot" [style.background]="colors[i % colors.length]"></span>
          {{ s.name }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .chart-container { width: 100%; }
    canvas { width: 100% !important; height: 220px !important; }
    .chart-legend { display: flex; gap: 16px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--gray-500); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  `]
})
export class LineChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() series: { name: string; data: number[] }[] = [];
  @Input() labels: string[] = [];
  @Input() colors: string[] = ['#2563EB', '#16A34A', '#DC2626', '#EA580C'];

  ngAfterViewInit() { this.draw(); }
  ngOnChanges(changes: SimpleChanges) { if (this.canvasRef) this.draw(); }

  private draw() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.series.length) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 10, right: 10, bottom: 30, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    let max = 0;
    this.series.forEach(s => { max = Math.max(max, ...s.data); });
    max = max * 1.1 || 1;

    ctx.clearRect(0, 0, w, h);

    // Grid
    const gray100 = getComputedStyle(document.documentElement).getPropertyValue('--gray-100').trim() || '#F3F4F6';
    const gray400 = getComputedStyle(document.documentElement).getPropertyValue('--gray-400').trim() || '#9CA3AF';
    const gray500 = getComputedStyle(document.documentElement).getPropertyValue('--gray-500').trim() || '#6B7280';

    ctx.strokeStyle = gray100;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (chartH * i / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = gray400;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.formatNum(max * i / 4), padding.left - 6, y + 4);
    }

    // X labels
    const maxLabels = Math.min(this.labels.length, 8);
    const step = Math.ceil(this.labels.length / maxLabels);
    this.labels.forEach((label, i) => {
      if (i % step !== 0) return;
      const x = padding.left + (chartW * i / (this.labels.length - 1 || 1));
      ctx.fillStyle = gray500;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, h - 8);
    });

    // Lines
    this.series.forEach((s, si) => {
      const color = this.colors[si % this.colors.length];
      const points: { x: number; y: number }[] = [];

      s.data.forEach((val, i) => {
        const x = padding.left + (chartW * i / (s.data.length - 1 || 1));
        const y = padding.top + chartH - (val / max) * chartH;
        points.push({ x, y });
      });

      // Fill area
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // Dots
      points.forEach(p => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
  }

  private formatNum(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return Math.round(n).toString();
  }
}
