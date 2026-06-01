import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  BarberServiceItem,
  CreateServiceRequest,
  UpdateServiceRequest
} from '../models/service.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  constructor(private api: ApiService) {}

  getServices(): Observable<BarberServiceItem[]> {
    return this.api.get<BarberServiceItem[]>('/services');
  }

  getService(id: number): Observable<BarberServiceItem> {
    return this.api.get<BarberServiceItem>(`/services/${id}`);
  }

  createService(body: CreateServiceRequest): Observable<BarberServiceItem> {
    return this.api.post<BarberServiceItem, CreateServiceRequest>('/services', body);
  }

  updateService(id: number, body: UpdateServiceRequest): Observable<BarberServiceItem> {
    return this.api.put<BarberServiceItem, UpdateServiceRequest>(`/services/${id}`, body);
  }

  deleteService(id: number): Observable<BarberServiceItem> {
    return this.api.delete<BarberServiceItem>(`/services/${id}`);
  }
}
