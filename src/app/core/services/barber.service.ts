import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { BarberApiItem } from '../models/barber-api.model';
import { User } from '../models/user.model';
import { BarbersApiService } from './barbers-api.service';

@Injectable({ providedIn: 'root' })
export class BarberService {
  private barbersSubject = new BehaviorSubject<User[]>([]);

  barbers$ = this.barbersSubject.asObservable();

  constructor(private barbersApi: BarbersApiService) {
    this.refreshBarbers();
  }

  getBarbers(): Observable<User[]> {
    this.refreshBarbers();
    return this.barbers$;
  }

  refreshBarbers() {
    this.barbersApi.getBarbers().subscribe({
      next: (barbers) => this.barbersSubject.next(barbers.map((barber) => this.toUser(barber))),
      error: () => this.barbersSubject.next([])
    });
  }

  addBarber(barber: User): Observable<BarberApiItem> {
    return this.barbersApi.createBarber({
      name: barber.name,
      email: barber.email,
      password: barber.password || '123456',
      phone: barber.phone,
      specialties: barber.specialties?.join(', ') || null,
      scheduleStart: barber.schedule?.start || '09:00',
      scheduleEnd: barber.schedule?.end || '18:00'
    }).pipe(tap(() => this.refreshBarbers()));
  }

  updateBarber(barber: User): Observable<BarberApiItem> {
    return this.barbersApi.updateBarber(Number(barber.id), {
      name: barber.name,
      email: barber.email,
      phone: barber.phone,
      specialties: barber.specialties?.join(', ') || null,
      scheduleStart: barber.schedule?.start || '09:00',
      scheduleEnd: barber.schedule?.end || '18:00'
    }).pipe(tap(() => this.refreshBarbers()));
  }

  deleteBarber(id: string): Observable<BarberApiItem> {
    return this.barbersApi.deleteBarber(Number(id)).pipe(tap(() => this.refreshBarbers()));
  }

  private toUser(barber: BarberApiItem): User {
    return {
      id: String(barber.id),
      name: barber.name,
      email: barber.email,
      role: 'barbero',
      phone: barber.phone || '',
      specialties: barber.specialties
        ? barber.specialties.split(',').map((specialty) => specialty.trim()).filter(Boolean)
        : [],
      schedule: {
        start: (barber.schedule_start || '09:00:00').slice(0, 5),
        end: (barber.schedule_end || '18:00:00').slice(0, 5)
      }
    };
  }
}
