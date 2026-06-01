import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PdfService } from '../../../core/services/pdf.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="space-y-6 animate-fade-in w-full">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Resumen</p>
          <h1 class="text-3xl font-extrabold text-[var(--text)] tracking-tight">Dashboard general</h1>
          <p class="text-sm text-[var(--text-soft)] mt-1">Indicadores clave de citas, ingresos y actividad.</p>
        </div>
        <button (click)="exportPdf()" class="premium-btn">
          <span class="material-symbols-rounded text-[20px]">download</span>
          Generar reporte
        </button>
      </div>

      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div *ngFor="let i of [1,2,3]" class="glass-card p-5 animate-pulse">
          <div class="h-4 w-28 bg-gray-300/40 mb-4"></div>
          <div class="h-9 w-24 bg-gray-300/30"></div>
        </div>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="glass-card p-5">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[var(--text-soft)] text-sm font-semibold mb-2">Ingresos del día</p>
              <p class="text-3xl font-black text-[var(--text)] tracking-tight">{{ todayIncome | currency }}</p>
            </div>
            <div class="icon-chip">
              <span class="material-symbols-rounded text-[26px]">payments</span>
            </div>
          </div>
        </div>

        <div class="glass-card p-5">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[var(--text-soft)] text-sm font-semibold mb-2">Cortes realizados</p>
              <p class="text-3xl font-black text-[var(--text)] tracking-tight">{{ todayCuts }}</p>
            </div>
            <div class="icon-chip">
              <span class="material-symbols-rounded text-[26px]">content_cut</span>
            </div>
          </div>
        </div>

        <div class="glass-card p-5">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[var(--text-soft)] text-sm font-semibold mb-2">Servicio estrella</p>
              <p class="text-xl mt-2 font-black text-[var(--text)] truncate max-w-[220px] leading-tight">{{ topService || 'N/A' }}</p>
            </div>
            <div class="icon-chip">
              <span class="material-symbols-rounded text-[26px]">emoji_events</span>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-5 md:p-6 h-[430px] flex flex-col" *ngIf="!loading">
        <div class="flex items-center justify-between gap-3 mb-5">
          <h3 class="text-lg font-extrabold text-[var(--text)] tracking-tight">Actividad de la semana</h3>
          <span class="text-xs font-semibold text-[var(--text-soft)] border border-[var(--border)] px-2.5 py-1 rounded-full">
            Citas por fecha
          </span>
        </div>
        <div class="flex-1 relative w-full h-full">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  appointmentService = inject(AppointmentService);
  pdfService = inject(PdfService);

  todayIncome = 0;
  todayCuts = 0;
  topService = '';
  chart: any;
  loading = true;

  ngOnInit() {
    this.appointmentService.appointments$.subscribe(apps => {
      const today = new Date().toISOString().split('T')[0];
      const todayApps = apps.filter(a => a.date === today && a.status === 'confirmada');

      this.todayIncome = todayApps.reduce((acc, curr) => acc + curr.payment.amount, 0);
      this.todayCuts = todayApps.length;

      const counts: Record<string, number> = {};
      apps.forEach(a => counts[a.service] = (counts[a.service] || 0) + 1);
      this.topService = Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0];
      this.loading = false;

      if(this.chart) this.initChart(apps);
    });
  }

  ngAfterViewInit() {
    this.appointmentService.appointments$.subscribe(apps => {
      this.initChart(apps);
    });
  }

  initChart(apps: any[]) {
    if(this.chart) this.chart.destroy();

    const dates = apps.map(a => a.date);
    const uniqueDates = [...new Set(dates)].sort();
    const counts = uniqueDates.map(d => apps.filter(a => a.date === d).length);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: uniqueDates,
        datasets: [{
          label: 'Citas por día',
          data: counts,
          backgroundColor: '#2563eb',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#64748b' } }
        },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.22)' } },
          y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148, 163, 184, 0.22)' } }
        }
      }
    });
  }

  exportPdf() {
    this.appointmentService.appointments$.subscribe(apps => {
      this.pdfService.exportAppointments(apps, new Date().toISOString().split('T')[0]);
    }).unsubscribe();
  }
}
