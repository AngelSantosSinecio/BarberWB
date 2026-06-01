import { Injectable, signal } from '@angular/core';
import { Appointment } from '../models/appointment.model';
import { BarberServiceItem } from '../models/service.model';

export interface ServiceConfig {
  label: string;
  amount: number;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private availableSlotsSignal = signal<string[]>([]);
  readonly availableSlots = this.availableSlotsSignal.asReadonly();
  readonly WORK_START_MINUTES = 10 * 60; // 10:00
  readonly WORK_END_MINUTES = 19 * 60;   // 19:00
  readonly BASE_INTERVAL = 30;

  readonly SERVICE_CATALOG: Record<string, ServiceConfig> = {
    'Corte Clásico': { label: 'Corte clásico', amount: 150, duration: 30 },
    'Corte + Barba': { label: 'Corte + barba', amount: 250, duration: 45 },
    'Premium': { label: 'Premium', amount: 300, duration: 60 },
    // Compatibilidad con datos previos guardados
    'Corte y Barba': { label: 'Corte + barba', amount: 250, duration: 45 },
    'Tinte': { label: 'Premium', amount: 300, duration: 60 }
  };

  generateBaseSlots(interval = this.BASE_INTERVAL): string[] {
    const slots: string[] = [];
    for (let minute = this.WORK_START_MINUTES; minute <= this.WORK_END_MINUTES; minute += interval) {
      slots.push(this.toHHmm(minute));
    }
    return slots;
  }

  getServiceConfig(service: string): ServiceConfig {
    return this.SERVICE_CATALOG[service] ?? this.SERVICE_CATALOG['Corte Clásico'];
  }

  registerApiServices(services: BarberServiceItem[]) {
    services.forEach((service) => {
      const config = {
        label: service.name,
        amount: Number(service.price),
        duration: service.duration_minutes
      };

      this.SERVICE_CATALOG[service.name] = config;
      this.SERVICE_CATALOG[String(service.id)] = config;
    });
  }

  getAvailableSlots(service: string, appointments: Appointment[], interval = this.BASE_INTERVAL): string[] {
    const requestedDuration = this.getServiceConfig(service).duration;
    const baseSlots = this.generateBaseSlots(interval);

    return baseSlots.filter((slot) => {
      const slotStart = this.toMinutes(slot);
      const slotEnd = slotStart + requestedDuration;

      return !appointments.some((appointment) => {
        const appointmentStart = this.toMinutes(appointment.time);
        const appointmentEnd = appointmentStart + this.getServiceConfig(appointment.service).duration;
        return slotStart < appointmentEnd && slotEnd > appointmentStart;
      });
    });
  }

  updateAvailableSlots(service: string, appointments: Appointment[], interval = this.BASE_INTERVAL) {
    const slots = this.getAvailableSlots(service, appointments, interval);
    this.availableSlotsSignal.set(slots);
    return slots;
  }

  toMinutes(hhmm: string): number {
    const [hours, minutes] = hhmm.split(':').map(Number);
    return hours * 60 + minutes;
  }

  toHHmm(totalMinutes: number): string {
    const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const mm = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
