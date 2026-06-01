import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="confirmation-page">
      <section class="confirmation-card">
        <div class="confirmation-icon">
          <span class="material-symbols-rounded">verified</span>
        </div>

        <p class="confirmation-kicker">Verificacion de correo</p>
        <h1>{{ title }}</h1>
        <p>{{ message }}</p>

        <a routerLink="/auth/login" class="confirmation-link">Ir al login</a>
      </section>
    </main>
  `
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  title = 'Confirmando correo';
  message = 'Estamos verificando tu enlace...';

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!token) {
      this.title = 'Enlace invalido';
      this.message = 'El enlace no contiene un token de verificacion valido.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.title = 'Correo confirmado';
        this.message = 'Tu cuenta ya esta activa. Ahora puedes iniciar sesion.';
      },
      error: (error: unknown) => {
        this.title = 'No se pudo confirmar';
        this.message = this.getErrorMessage(error);
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
