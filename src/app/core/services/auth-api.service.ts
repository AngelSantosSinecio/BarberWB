import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse
} from '../models/auth-api.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  constructor(private api: ApiService) {}

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse, LoginRequest>('/auth/login', body);
  }

  register(body: RegisterRequest): Observable<RegisterResponse> {
    return this.api.post<RegisterResponse, RegisterRequest>('/auth/register', body);
  }

  verifyEmail(body: VerifyEmailRequest): Observable<VerifyEmailResponse> {
    return this.api.post<VerifyEmailResponse, VerifyEmailRequest>('/auth/verify-email', body);
  }
}
