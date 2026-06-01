export interface AppointmentApiItem {
  id: number;
  client_id: number;
  client_name: string;
  client_email: string;
  barber_id: number;
  barber_name: string;
  service_id: number;
  service_name: string;
  duration_minutes: number;
  service_price: string;
  date: string;
  time: string;
  status: 'pendiente' | 'confirmada' | 'rechazada' | 'cancelada';
  payment: string;
  created_at: string;
}

export interface CreateAppointmentRequest {
  clientId: number;
  barberId: number;
  serviceId: number;
  date: string;
  time: string;
  payment: number;
}
