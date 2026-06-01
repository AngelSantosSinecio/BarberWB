import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppointmentApiItem, CreateAppointmentRequest } from '../models/appointment-api.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AppointmentsApiService {
  constructor(private api: ApiService) {}

  getAppointments(): Observable<AppointmentApiItem[]> {
    return this.api.get<AppointmentApiItem[]>('/appointments');
  }

  getAppointment(id: number): Observable<AppointmentApiItem> {
    return this.api.get<AppointmentApiItem>(`/appointments/${id}`);
  }

  createAppointment(body: CreateAppointmentRequest): Observable<AppointmentApiItem> {
    return this.api.post<AppointmentApiItem, CreateAppointmentRequest>('/appointments', body);
  }

  updateStatus(id: number, status: AppointmentApiItem['status']): Observable<AppointmentApiItem> {
    return this.api.patch<AppointmentApiItem, { status: AppointmentApiItem['status'] }>(
      `/appointments/${id}/status`,
      { status }
    );
  }

}
