export interface BarberServiceItem {
  id: number;
  name: string;
  duration_minutes: number;
  price: string;
  active: number;
}

export interface CreateServiceRequest {
  name: string;
  durationMinutes: number;
  price: number;
}

export interface UpdateServiceRequest extends CreateServiceRequest {
  active: boolean;
}
