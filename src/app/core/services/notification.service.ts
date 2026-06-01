import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastSignal = signal<{ message: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  get toast() { return this.toastSignal; }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.toastSignal.set({ message, type });
    setTimeout(() => this.toastSignal.set(null), 3000);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  warning(msg: string) { this.show(msg, 'warning'); }
  info(msg: string) { this.show(msg, 'info'); }
}
