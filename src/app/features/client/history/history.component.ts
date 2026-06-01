import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment } from '../../../core/models/appointment.model';
import { UiService } from '../../../core/services/ui.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in w-full">
      <div>
        <p class="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Cliente</p>
        <h2 class="text-3xl font-black text-[var(--text)]">Mi historial y citas</h2>
        <p class="text-sm text-[var(--text-soft)] mt-1">Consulta tus reservaciones y estado de atención.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass-card p-5">
          <p class="text-[var(--text-soft)] text-sm font-semibold mb-2">Total invertido</p>
          <p class="text-3xl font-black text-[var(--text)]">\${{ totalSpent }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-[var(--text-soft)] text-sm font-semibold mb-2">Citas realizadas</p>
          <p class="text-3xl font-black text-[var(--text)]">{{ completedApps }}</p>
        </div>
      </div>

      <div class="glass-card p-5 md:p-6">
        <h3 class="text-lg font-extrabold mb-5 text-[var(--text)]">Mis citas</h3>

        <div *ngIf="loading" class="space-y-3">
          <div *ngFor="let i of [1,2,3]" class="p-4 border border-[var(--border)] bg-[var(--surface-2)] animate-pulse">
            <div class="h-5 w-44 bg-gray-300/40 mb-2"></div>
            <div class="h-4 w-28 bg-gray-300/30 mb-2"></div>
            <div class="h-4 w-36 bg-gray-300/30"></div>
          </div>
        </div>

        <div *ngIf="!loading && appointments.length === 0" class="empty-state">
          <span class="material-symbols-rounded text-[44px] mb-3">event_busy</span>
          <p class="text-lg font-medium">No tienes citas registradas.</p>
        </div>

        <div class="space-y-3 max-h-[560px] overflow-y-auto pr-2">
          <div *ngFor="let apt of appointments" class="bg-[var(--surface-2)] p-4 flex flex-col md:flex-row md:justify-between md:items-center border border-[var(--border)] border-l-4"
                [ngClass]="{
                'border-l-amber-500': apt.status === 'pendiente',
                'border-l-emerald-500': apt.status === 'confirmada',
                'border-l-red-500': apt.status === 'rechazada',
                'border-l-slate-400': apt.status === 'cancelada'
              }">
            <div class="mb-4 md:mb-0">
              <p class="font-black text-lg text-[var(--text)]">{{ apt.date | date:'longDate' }} <span class="text-blue-600 px-2">·</span> {{ apt.time }}</p>
              <p class="text-[var(--text-soft)] mt-1 font-medium">Barbero: <span class="font-bold text-[var(--text)]">{{ apt.barberName }}</span></p>
              <div class="flex flex-wrap items-center gap-2 mt-2">
                <span class="text-sm text-[var(--text)] bg-[var(--surface)] px-3 py-1 rounded-lg border border-[var(--border)] font-semibold">{{ apt.service }}</span>
                <span class="text-sm font-bold text-blue-600">\${{ apt.payment.amount }}</span>
              </div>
            </div>
            <div class="flex flex-col items-start md:items-end gap-3">
              <span class="status-badge"
                    [ngClass]="{
                      'bg-amber-500/10 text-amber-700 border-amber-500/40': apt.status === 'pendiente',
                      'bg-emerald-500/10 text-emerald-700 border-emerald-500/40': apt.status === 'confirmada',
                      'bg-red-500/10 text-red-700 border-red-500/40': apt.status === 'rechazada',
                      'bg-slate-500/10 text-slate-600 border-slate-500/40': apt.status === 'cancelada'
                    }">
                {{ apt.status | uppercase }}
              </span>
              <button *ngIf="apt.status === 'pendiente'" (click)="cancel(apt.id)" class="text-sm text-red-600 hover:text-red-700 font-bold transition">
                Cancelar cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientHistoryComponent implements OnInit {
  aptService = inject(AppointmentService);
  authService = inject(AuthService);
  uiService = inject(UiService);
  notificationService = inject(NotificationService);

  appointments: Appointment[] = [];
  totalSpent = 0;
  completedApps = 0;
  loading = true;

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if(!user) return;

    this.aptService.getByClient(user.id).subscribe(apps => {
      this.appointments = apps.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const cnf = apps.filter(x => x.status === 'confirmada');
      this.completedApps = cnf.length;
      this.totalSpent = cnf.reduce((sum, a) => sum + a.payment.amount, 0);
      this.loading = false;
    });
  }

  async cancel(id: string) {
    const ok = await this.uiService.confirm({
      title: 'Cancelar cita',
      message: '¿Seguro que quieres cancelar esta cita?',
      confirmText: 'Cancelar',
      tone: 'danger'
    });
    if (!ok) return;

    this.aptService.updateStatus(id, 'cancelada');
    this.notificationService.info('Cita cancelada');
  }
}
