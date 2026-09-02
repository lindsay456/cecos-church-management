import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #canvas></canvas>
      <div class="chart-legend" *ngIf="labels.length">
        <span class="legend-item" *ngFor="let l of labels; let i = index">
          <span class="legend-dot" [style.background]="colors[i % colors.length]"></span>
          {{ l }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .chart-container { width: 100%; }
    canvas { width: 100% !important; height: 220px !important; }
    .chart-legend { display: flex; gap: 16px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--gray-500); }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
  `]
})
export class BarChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() colors: string[] = ['#2563EB', '#16A34A', '#DC2626', '#EA580C', '#9333EA'];
  @Input() maxValue?: number;

  ngAfterViewInit() { this.draw(); }
  ngOnChanges(changes: SimpleChanges) { if (this.canvasRef) this.draw(); }

  private draw() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.data.length) return;

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
    const max = this.maxValue || Math.max(...this.data) * 1.1 || 1;
    const barW = Math.min(chartW / this.data.length * 0.6, 40);
    const gap = chartW / this.data.length;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--gray-100').trim() || '#F3F4F6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (chartH * i / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--gray-400').trim() || '#9CA3AF';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.formatNum(max * i / 4), padding.left - 6, y + 4);
    }

    // Bars
    this.data.forEach((val, i) => {
      const barH = (val / max) * chartH;
      const x = padding.left + gap * i + (gap - barW) / 2;
      const y = padding.top + chartH - barH;
      const color = this.colors[i % this.colors.length];

      ctx.fillStyle = color;
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, padding.top + chartH);
      ctx.lineTo(x, padding.top + chartH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();

      // Label
      if (this.labels[i]) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--gray-500').trim() || '#6B7280';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.labels[i], x + barW / 2, h - 8);
      }
    });
  }

  private formatNum(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return Math.round(n).toString();
  }
}
