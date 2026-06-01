import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

import { Appointment } from '../models/appointment.model';
import { AppointmentApiItem } from '../models/appointment-api.model';
import { AppointmentsApiService } from './appointments-api.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  appointments$ = this.appointmentsSubject.asObservable();

  constructor(private appointmentsApi: AppointmentsApiService) {
    this.refreshAppointments();
  }

  refreshAppointments() {
    this.appointmentsApi.getAppointments().subscribe({
      next: (appointments) => {
        this.appointmentsSubject.next(appointments.map((appointment) => this.toAppointment(appointment)));
      },
      error: () => this.appointmentsSubject.next([])
    });
  }

  create(appointment: Appointment): Observable<Appointment> {
    return this.appointmentsApi.createAppointment({
      clientId: Number(appointment.clientId),
      barberId: Number(appointment.barberId),
      serviceId: Number(appointment.service),
      date: appointment.date,
      time: appointment.time,
      payment: appointment.payment.amount
    }).pipe(
      map((createdAppointment) => this.toAppointment(createdAppointment)),
      tap(() => this.refreshAppointments())
    );
  }

  updateStatus(id: string, status: Appointment['status']) {
    this.appointmentsApi.updateStatus(Number(id), status).subscribe({
      next: () => this.refreshAppointments()
    });
  }

  getByDateAndBarber(date: string, barberId: string) {
    return this.appointments$.pipe(
      map((appointments) => appointments.filter((appointment) => (
        appointment.date === date && appointment.barberId === barberId
      )))
    );
  }

  getByDate(date: string) {
    return this.appointments$.pipe(
      map((appointments) => appointments.filter((appointment) => appointment.date === date))
    );
  }

  getByBarber(barberId: string) {
    return this.appointments$.pipe(
      map((appointments) => appointments.filter((appointment) => appointment.barberId === barberId))
    );
  }

  getByClient(clientId: string) {
    return this.appointments$.pipe(
      map((appointments) => appointments.filter((appointment) => appointment.clientId === clientId))
    );
  }

  getAll() {
    return this.appointments$;
  }

  private toAppointment(appointment: AppointmentApiItem): Appointment {
    const amount = Number(appointment.service_price);
    return {
      id: String(appointment.id),
      clientId: String(appointment.client_id),
      clientName: appointment.client_name,
      barberId: String(appointment.barber_id),
      barberName: appointment.barber_name,
      date: this.toDateOnly(appointment.date),
      time: appointment.time.slice(0, 5),
      status: appointment.status,
      service: appointment.service_name,
      createdAt: appointment.created_at,
      payment: {
        amount
      }
    };
  }

  private toDateOnly(value: string): string {
    return value.includes('T') ? value.split('T')[0] : value;
  }
}
