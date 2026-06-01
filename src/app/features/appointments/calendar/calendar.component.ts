import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { BarberService } from '../../../core/services/barber.service';
import { FormsModule } from '@angular/forms';
import { Appointment } from '../../../core/models/appointment.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LogService } from '../../../core/services/log.service';
import { UiService } from '../../../core/services/ui.service';
import { ServicesApiService } from '../../../core/services/services-api.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col gap-4">
        <div>
          <p class="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Operación diaria</p>
          <h2 class="text-3xl font-black text-[var(--text)]">Agenda del día</h2>
          <p class="text-sm text-[var(--text-soft)] mt-1">Filtra y confirma citas desde una vista central.</p>
        </div>

        <div class="glass-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="date" [(ngModel)]="currentDate" (change)="loadAppointments()" class="premium-input">
          <select [(ngModel)]="selectedBarber" (change)="loadAppointments()" class="premium-select">
            <option value="">Todos los barberos</option>
            <option *ngFor="let b of barbers$ | async" [value]="b.id">{{ b.name }}</option>
          </select>
          <select [(ngModel)]="selectedService" (change)="loadAppointments()" class="premium-select">
            <option value="">Todos los servicios</option>
            <option *ngFor="let service of serviceFilters" [value]="service">{{ service }}</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="glass-card p-5 animate-pulse">
          <div class="h-5 w-24 bg-gray-300/40 mb-3"></div>
          <div class="h-4 w-32 bg-gray-300/30 mb-2"></div>
          <div class="h-4 w-20 bg-gray-300/30 mb-4"></div>
          <div class="h-9 w-full bg-gray-300/30"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngIf="!loading && appointments.length === 0" class="col-span-full">
          <div class="empty-state">
            <span class="material-symbols-rounded text-[44px] mb-3">calendar_clock</span>
            <p class="text-lg font-semibold">No hay citas agendadas para esta fecha.</p>
          </div>
        </div>

        <article *ngFor="let apt of appointments" class="glass-card p-5 border-l-4"
             [ngClass]="{
                'border-l-amber-500': apt.status === 'pendiente',
                'border-l-emerald-500': apt.status === 'confirmada',
                'border-l-red-500': apt.status === 'rechazada',
                'border-l-slate-400': apt.status === 'cancelada'
             }">
          <div class="flex justify-between items-start gap-4 mb-4">
            <div>
              <p class="font-black text-2xl text-[var(--text)] mb-1">{{ apt.time }}</p>
              <p class="font-semibold text-[var(--text)]">{{ apt.clientName }}</p>
              <p class="text-xs text-[var(--text-soft)] mt-1">Tel: {{ apt.clientPhone || 'Sin teléfono' }}</p>
              <p class="text-xs text-[var(--text-soft)] mt-2 flex items-center gap-1">
                <span class="material-symbols-rounded text-[14px]">content_cut</span>
                {{ apt.service }}
              </p>
              <p class="text-xs text-blue-600 mt-1 font-semibold">{{ apt.barberName }}</p>
            </div>
            <div class="flex flex-col gap-2 items-end">
              <span class="status-badge"
                    [ngClass]="{
                      'bg-amber-500/10 text-amber-700 border-amber-500/40': apt.status === 'pendiente',
                      'bg-emerald-500/10 text-emerald-700 border-emerald-500/40': apt.status === 'confirmada',
                      'bg-red-500/10 text-red-700 border-red-500/40': apt.status === 'rechazada',
                      'bg-slate-500/10 text-slate-600 border-slate-500/40': apt.status === 'cancelada'
                    }">
                {{ apt.status | uppercase }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-4 mt-2">
            <button *ngIf="apt.status === 'pendiente' && canManage" (click)="confirmAppointment(apt)" class="premium-btn-outline text-xs">Confirmar</button>
            <button *ngIf="apt.status === 'pendiente' && canManage" (click)="rejectAppointment(apt)" class="text-xs font-semibold text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">Rechazar</button>
            <button *ngIf="apt.status !== 'cancelada' && apt.status !== 'rechazada' && canManage" (click)="cancelAppointment(apt)" class="premium-btn-outline text-xs">Cancelar</button>
          </div>
        </article>
      </div>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  aptService = inject(AppointmentService);
  barberService = inject(BarberService);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  logService = inject(LogService);
  uiService = inject(UiService);
  servicesApi = inject(ServicesApiService);

  barbers$ = this.barberService.barbers$;
  currentDate = new Date().toISOString().split('T')[0];
  selectedBarber = '';
  selectedService = '';
  allAppointments: Appointment[] = [];
  appointments: Appointment[] = [];
  loading = true;
  serviceFilters: string[] = [];

  get canManage() {
    const role = this.authService.currentUserValue?.role;
    return role === 'admin' || role === 'barbero';
  }

  ngOnInit() {
    this.servicesApi.getServices().subscribe({
      next: (services) => {
        this.serviceFilters = services.map((service) => service.name);
      }
    });

    this.aptService.appointments$.subscribe((appointments) => {
      this.allAppointments = appointments;
      this.loadAppointments();
    });
  }

  loadAppointments() {
    this.loading = true;
    this.appointments = this.allAppointments.filter(a => {
      const matchDate = a.date === this.currentDate;
      const matchBarber = this.selectedBarber ? a.barberId === this.selectedBarber : true;
      const matchService = this.selectedService ? a.service === this.selectedService : true;
      return matchDate && matchBarber && matchService;
    });
    this.appointments.sort((a,b) => a.time.localeCompare(b.time));
    this.loading = false;
  }

  updateStatus(id: string, s: 'confirmada' | 'cancelada' | 'rechazada') {
    this.aptService.updateStatus(id, s);
  }

  async confirmAppointment(apt: Appointment) {
    const ok = await this.uiService.confirm({
      title: 'Confirmar cita',
      message: `¿Deseas confirmar la cita de ${apt.clientName} a las ${apt.time}?`,
      confirmText: 'Confirmar'
    });
    if (!ok) return;

    this.updateStatus(apt.id, 'confirmada');
    this.notificationService.success('Cita confirmada correctamente.');
    this.logService.logAction(
      'edición',
      'Mensaje',
      apt.id,
      this.authService.currentUserValue?.id || 'sys',
      this.authService.currentUserValue?.name || 'Sistema',
      'Hola, tu cita ha sido confirmada. Te esperamos en el horario seleccionado. Gracias por tu preferencia.'
    );
  }

  async rejectAppointment(apt: Appointment) {
    const ok = await this.uiService.confirm({
      title: 'Rechazar cita',
      message: `¿Deseas rechazar la cita de ${apt.clientName}?`,
      confirmText: 'Rechazar',
      tone: 'danger'
    });
    if (!ok) return;

    this.updateStatus(apt.id, 'rechazada');
    this.notificationService.warning('Cita rechazada.');
    this.logService.logAction(
      'edición',
      'Mensaje',
      apt.id,
      this.authService.currentUserValue?.id || 'sys',
      this.authService.currentUserValue?.name || 'Sistema',
      'Hola, lamentamos informarte que tu cita no podrá ser atendida en el horario seleccionado. Te invitamos a reagendar en otro horario disponible.'
    );
  }

  async cancelAppointment(apt: Appointment) {
    const ok = await this.uiService.confirm({
      title: 'Cancelar cita',
      message: `¿Deseas cancelar la cita de ${apt.clientName}?`,
      confirmText: 'Cancelar',
      tone: 'danger'
    });
    if (!ok) return;

    this.updateStatus(apt.id, 'cancelada');
    this.notificationService.info('Cita cancelada.');
  }
}
