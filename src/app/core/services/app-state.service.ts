import { Injectable, inject, signal } from '@angular/core';
import { Appointment } from '../models/appointment.model';
import { AuthService } from './auth.service';
import { AppointmentService } from './appointment.service';
import { ScheduleService } from './schedule.service';
import { UiService } from './ui.service';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private scheduleService = inject(ScheduleService);
  private uiService = inject(UiService);

  readonly currentUser = signal(this.authService.currentUserValue);
  readonly appointments = signal<Appointment[]>([]);
  readonly availableSlots = this.scheduleService.availableSlots;
  readonly globalLoading = this.uiService.isLoading;

  constructor() {
    this.authService.currentUser$.subscribe(user => this.currentUser.set(user));
    this.appointmentService.appointments$.subscribe(appointments => this.appointments.set(appointments));
  }
}
