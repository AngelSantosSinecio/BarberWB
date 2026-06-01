import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  emailVerificationRequired: boolean;
  user: User;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  user: User;
}
