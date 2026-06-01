import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { BarberService } from '../../../core/services/barber.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { ScheduleService } from '../../../core/services/schedule.service';
import { combineLatest, Subject } from 'rxjs';
import { startWith, take, takeUntil } from 'rxjs/operators';
import { UiService } from '../../../core/services/ui.service';
import { ServicesApiService } from '../../../core/services/services-api.service';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="animate-fade-in">
      <div class="max-w-4xl mx-auto">
        <header class="mb-6">
          <p class="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Nueva reservación</p>
          <h2 class="text-3xl font-black text-[var(--text)]">Agendar cita</h2>
          <p class="text-sm text-[var(--text-soft)] mt-2">Selecciona servicio, barbero y un horario disponible.</p>
        </header>

        <div class="glass-card p-5 md:p-6">
          <form [formGroup]="aptForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold mb-1.5">Servicio</label>
                <select formControlName="service" class="premium-select">
                  <option *ngFor="let service of serviceOptions" [value]="service.key">
                    {{ service.label }} ({{ '$' + service.amount }}) · {{ service.duration }} min
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1.5">Barbero / estilista</label>
                <select formControlName="barberId" class="premium-select">
                  <option value="">Selecciona un barbero</option>
                  <option *ngFor="let b of barbers$ | async" [value]="b.id">{{ b.name }} - {{ b.specialties?.join(', ') }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
              <div>
                <label class="block text-sm font-semibold mb-1.5">Fecha</label>
                <input type="date" formControlName="date" [min]="today" class="premium-input">
              </div>
              <div class="border border-[var(--border)] bg-[var(--surface-2)] p-3 rounded-lg">
                <p class="text-xs uppercase tracking-wider text-[var(--text-soft)] font-bold">Duración estimada</p>
                <p class="text-2xl font-black text-[var(--text)]">{{ selectedDuration }} min</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-3">Horario disponible</label>
              <div class="schedule-grid">
                <button
                  *ngFor="let slot of availableSlots()"
                  type="button"
                  class="schedule-slot"
                  [class.schedule-slot--active]="aptForm.controls.time.value === slot"
                  (click)="selectSlot(slot)"
                >
                  {{ slot }}
                </button>
              </div>
              <div *ngIf="availableSlots().length === 0" class="empty-state mt-4 !py-10">
                <span class="material-symbols-rounded text-[42px] mb-2">event_busy</span>
                <p class="font-semibold">No hay horarios disponibles para esta selección.</p>
              </div>
            </div>

            <button type="submit" [disabled]="aptForm.invalid" class="premium-btn w-full">
              Confirmar cita
            </button>
          </form>
        </div>
      </div>
    </section>
  `
})
export class CreateAppointmentComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  aptService = inject(AppointmentService);
  barberService = inject(BarberService);
  authService = inject(AuthService);
  router = inject(Router);
  notif = inject(NotificationService);
  scheduleService = inject(ScheduleService);
  uiService = inject(UiService);
  servicesApi = inject(ServicesApiService);
  private readonly destroy$ = new Subject<void>();

  barbers$ = this.barberService.barbers$;
  today = new Date().toISOString().split('T')[0];
  availableSlots = this.scheduleService.availableSlots;

  serviceOptions = [
    { key: 'Corte Clásico', ...this.scheduleService.getServiceConfig('Corte Clásico') },
    { key: 'Corte + Barba', ...this.scheduleService.getServiceConfig('Corte + Barba') },
    { key: 'Premium', ...this.scheduleService.getServiceConfig('Premium') }
  ];

  aptForm = this.fb.group({
    service: ['Corte Clásico', Validators.required],
    barberId: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required]
  });

  get selectedDuration(): number {
    return this.scheduleService.getServiceConfig(this.aptForm.controls.service.value || '').duration;
  }

  ngOnInit() {
    this.servicesApi.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.scheduleService.registerApiServices(services);
          this.serviceOptions = services.map((service) => ({
            key: String(service.id),
            label: service.name,
            amount: Number(service.price),
            duration: service.duration_minutes
          }));

          if (this.serviceOptions.length > 0) {
            this.aptForm.patchValue({ service: this.serviceOptions[0].key });
          }
        },
        error: () => {
          this.notif.error('No se pudieron cargar los servicios del backend.');
        }
      });

    const service$ = this.aptForm.controls.service.valueChanges.pipe(startWith(this.aptForm.controls.service.value));
    const barber$ = this.aptForm.controls.barberId.valueChanges.pipe(startWith(this.aptForm.controls.barberId.value));
    const date$ = this.aptForm.controls.date.valueChanges.pipe(startWith(this.aptForm.controls.date.value));

    combineLatest([service$, barber$, date$, this.aptService.appointments$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([service, barberId, date, appointments]) => {
        if (!service || !barberId || !date) {
          this.scheduleService.updateAvailableSlots('Corte Clásico', []);
          this.aptForm.patchValue({ time: '' }, { emitEvent: false });
          return;
        }

        const barberAppointments = appointments.filter(
          appointment => appointment.date === date && appointment.barberId === barberId && appointment.status !== 'cancelada'
        );
        const slots = this.scheduleService.updateAvailableSlots(service, barberAppointments);

        if (!slots.includes(this.aptForm.controls.time.value || '')) {
          this.aptForm.patchValue({ time: '' }, { emitEvent: false });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectSlot(slot: string) {
    this.aptForm.patchValue({ time: slot });
  }

  onSubmit() {
    if(this.aptForm.invalid) return;
    this.uiService.showLoading();

    const v = this.aptForm.value;
    const user = this.authService.currentUserValue;

    this.aptService.getByDate(v.date!).pipe(take(1)).subscribe(apps => {
      const barberAppointments = apps.filter(
        appointment => appointment.barberId === v.barberId && appointment.status !== 'cancelada'
      );
      const currentAvailable = this.scheduleService.getAvailableSlots(v.service!, barberAppointments);
      if (!currentAvailable.includes(v.time!)) {
        this.notif.error('Ese horario ya no está disponible, selecciona otro.');
        this.uiService.hideLoading();
        return;
      }

      this.barberService.barbers$.pipe(take(1)).subscribe(barbers => {
        const barber = barbers.find(b => b.id === v.barberId);
        const amount = this.scheduleService.getServiceConfig(v.service!).amount;

        if (!barber) {
          this.notif.error('Selecciona un barbero válido.');
          this.uiService.hideLoading();
          return;
        }

        this.aptService.create({
          id: crypto.randomUUID(),
          clientId: user?.id || 'invitado',
          clientName: user?.name || 'Cliente invitado',
          clientPhone: user?.phone || 'Sin teléfono',
          barberId: barber.id,
          barberName: barber.name,
          date: v.date!,
          time: v.time!,
          status: 'pendiente',
          service: String(v.service!),
          createdAt: new Date().toISOString(),
          payment: { amount }
        }).subscribe({
          next: () => {
            this.notif.success('Cita creada. Revisa tu correo para confirmarla.');
            this.uiService.hideLoading();
            this.router.navigate(['/client/history']);
          },
          error: (error) => {
            this.notif.error(error?.error?.message || 'No se pudo crear la cita.');
            this.uiService.hideLoading();
          }
        });
      });
    });
  }
}
