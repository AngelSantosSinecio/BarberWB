import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BarberApiItem, CreateBarberRequest, UpdateBarberRequest } from '../models/barber-api.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BarbersApiService {
  constructor(private api: ApiService) {}

  getBarbers(): Observable<BarberApiItem[]> {
    return this.api.get<BarberApiItem[]>('/barbers');
  }

  getBarber(id: number): Observable<BarberApiItem> {
    return this.api.get<BarberApiItem>(`/barbers/${id}`);
  }

  createBarber(body: CreateBarberRequest): Observable<BarberApiItem> {
    return this.api.post<BarberApiItem, CreateBarberRequest>('/barbers', body);
  }

  updateBarber(id: number, body: UpdateBarberRequest): Observable<BarberApiItem> {
    return this.api.put<BarberApiItem, UpdateBarberRequest>(`/barbers/${id}`, body);
  }

  deleteBarber(id: number): Observable<BarberApiItem> {
    return this.api.delete<BarberApiItem>(`/barbers/${id}`);
  }
}
