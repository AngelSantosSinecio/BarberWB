import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  AppointmentConfirmationAction,
  AppointmentConfirmationApiService
} from '../../../core/services/appointment-confirmation-api.service';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="confirmation-page">
      <section class="confirmation-card">
        <div class="confirmation-icon">
          <span class="material-symbols-rounded">mark_email_read</span>
        </div>

        <p class="confirmation-kicker">Confirmacion por correo</p>
        <h1>{{ title }}</h1>
        <p>{{ message }}</p>

        <div *ngIf="!finished && token" class="confirmation-actions">
          <button type="button" class="premium-btn" [disabled]="loading" (click)="send('confirm')">
            {{ loading ? 'Procesando...' : 'Aceptar cita' }}
          </button>
          <button type="button" class="premium-btn-outline" [disabled]="loading" (click)="send('cancel')">
            Cancelar cita
          </button>
        </div>

        <a *ngIf="finished || !token" routerLink="/auth/login" class="confirmation-link">Volver al login</a>
      </section>
    </main>
  `
})
export class EmailConfirmationComponent {
  private route = inject(ActivatedRoute);
  private confirmationApi = inject(AppointmentConfirmationApiService);

  token = this.route.snapshot.queryParamMap.get('token') || '';
  loading = false;
  finished = false;
  title = this.token ? 'Confirma tu cita' : 'Enlace invalido';
  message = this.token
    ? 'Elige si deseas aceptar o cancelar esta cita. Esta accion confirma tu decision con BarberApp.'
    : 'El enlace no contiene un token de confirmacion valido.';

  send(action: AppointmentConfirmationAction) {
    if (!this.token || this.loading) return;

    this.loading = true;
    this.confirmationApi.confirmByEmail(this.token, action).subscribe({
      next: (response) => {
        this.title = action === 'confirm' ? 'Solicitud aceptada' : 'Cita cancelada';
        this.message = response.message || (action === 'confirm'
          ? 'Tu cita sigue pendiente hasta que BarberApp la confirme.'
          : 'Tu cita fue cancelada correctamente.');
        this.finished = true;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.title = 'No se pudo confirmar';
        this.message = this.getErrorMessage(error);
        this.finished = true;
        this.loading = false;
      }
    });
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || 'El enlace no es valido o ya fue utilizado.';
    }

    return 'El enlace no es valido o ya fue utilizado.';
  }
}
