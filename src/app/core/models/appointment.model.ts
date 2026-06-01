export type AppointmentStatus = 'pendiente' | 'confirmada' | 'rechazada' | 'cancelada';

export interface Payment {
  amount: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  service: string;
  payment: Payment;
  createdAt: string;
}
