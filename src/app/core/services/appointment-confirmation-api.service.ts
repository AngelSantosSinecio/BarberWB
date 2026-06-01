import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { AppointmentApiItem } from '../models/appointment-api.model';

export type AppointmentConfirmationAction = 'confirm' | 'cancel';

@Injectable({ providedIn: 'root' })
export class AppointmentConfirmationApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  confirmByEmail(token: string, action: AppointmentConfirmationAction): Observable<ApiResponse<AppointmentApiItem>> {
    return this.http.post<ApiResponse<AppointmentApiItem>>(`${this.apiUrl}/appointments/confirm-email`, {
      token,
      action
    });
  }
}
