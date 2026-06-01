export type Role = 'admin' | 'barbero' | 'cliente';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone: string;
  active?: boolean;
  email_verified?: boolean;
  specialties?: string[]; // Para barberos
  schedule?: {
    start: string; // ej. '09:00'
    end: string;   // ej. '18:00'
  };
}
