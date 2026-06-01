import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  readonly users$ = this.usersSubject.asObservable();

  constructor(private api: ApiService) {
    this.refreshUsers();
  }

  refreshUsers() {
    this.api.get<User[]>('/users').subscribe((users) => {
      this.usersSubject.next(users.map((user) => ({ ...user, id: String(user.id) })));
    });
  }

  setActive(id: string, active: boolean): Observable<User> {
    return this.api
      .patch<User, { active: boolean }>(`/users/${id}/active`, { active })
      .pipe(tap(() => this.refreshUsers()));
  }

  deleteUser(id: string): Observable<User> {
    return this.api
      .delete<User>(`/users/${id}`)
      .pipe(tap(() => this.refreshUsers()));
  }
}
