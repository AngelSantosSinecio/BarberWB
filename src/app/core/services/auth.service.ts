import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { LoginResponse, RegisterRequest, RegisterResponse, VerifyEmailResponse } from '../models/auth-api.model';
import { User } from '../models/user.model';
import { LogService } from './log.service';
import { AuthApiService } from './auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private logService: LogService,
    private authApi: AuthApiService
  ) {}

  private getStoredUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.authApi.login({ email, password }).pipe(
      tap((response) => this.startSession(response))
    );
  }

  register(body: RegisterRequest): Observable<RegisterResponse> {
    return this.authApi.register(body);
  }

  verifyEmail(token: string): Observable<VerifyEmailResponse> {
    return this.authApi.verifyEmail({ token });
  }

  private startSession({ token, user }: LoginResponse) {
    const normalizedUser = { ...user, id: String(user.id) };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
    }

    this.currentUserSubject.next(normalizedUser);
    this.logService.logAction('login', 'Sesion', normalizedUser.id, normalizedUser.id, normalizedUser.name, 'Inicio de sesion');

    if (normalizedUser.role === 'admin') this.router.navigate(['/admin/dashboard']);
    else if (normalizedUser.role === 'barbero') this.router.navigate(['/appointments/calendar']);
    else this.router.navigate(['/client/history']);
  }

  logout() {
    const user = this.currentUserValue;
    if (user) this.logService.logAction('logout', 'Sesion', user.id, user.id, user.name, 'Cierre de sesion');

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }

    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
}
