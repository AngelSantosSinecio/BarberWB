export interface BarberApiItem {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  specialties: string | null;
  schedule_start: string | null;
  schedule_end: string | null;
  active: number;
}

export interface CreateBarberRequest {
  name: string;
  email: string;
  password?: string;
  phone: string;
  specialties?: string | null;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export interface UpdateBarberRequest extends CreateBarberRequest {}
