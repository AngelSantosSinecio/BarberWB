import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="login-page">
      <section class="login-card">
        <div class="login-brand">
          <div class="login-logo">
            <span class="material-symbols-rounded">content_cut</span>
            <span class="login-logo-text">Barber<br>App</span>
          </div>
          <p class="login-kicker">Barber shop</p>
          <h1>{{ isRegisterMode ? 'Crear cuenta' : 'Bienvenido' }}</h1>
          <p class="login-copy">
            {{ isRegisterMode ? 'Registrate para reservar tus citas.' : 'Accede para gestionar tus citas y servicios.' }}
          </p>
        </div>

        <div class="login-tabs" role="tablist" aria-label="Acceso">
          <button type="button" [class.is-active]="!isRegisterMode" (click)="setMode('login')">Entrar</button>
          <button type="button" [class.is-active]="isRegisterMode" (click)="setMode('register')">Registrarse</button>
        </div>

        <form *ngIf="!isRegisterMode" [formGroup]="loginForm" (ngSubmit)="login()" class="login-form">
          <label>
            <span>Correo electronico</span>
            <input type="email" formControlName="email" placeholder="correo@ejemplo.com" autocomplete="email" (input)="clearLoginError()">
            <small *ngIf="showLoginFieldError('email')" class="login-field-error">
              {{ loginForm.controls.email.hasError('email') ? 'Ingresa un correo valido.' : 'El correo es obligatorio.' }}
            </small>
          </label>

          <label>
            <span>Contrasena</span>
            <input type="password" formControlName="password" placeholder="Tu contrasena" autocomplete="current-password" (input)="clearLoginError()">
            <small *ngIf="showLoginFieldError('password')" class="login-field-error">
              La contrasena es obligatoria.
            </small>
          </label>

          <p *ngIf="loginError" class="login-error" role="alert">{{ loginError }}</p>

          <button type="submit" [disabled]="loginForm.invalid || loading" class="login-submit">
            {{ loading ? 'Entrando...' : 'Iniciar sesion' }}
          </button>
        </form>

        <form *ngIf="isRegisterMode" [formGroup]="registerForm" (ngSubmit)="register()" class="login-form">
          <label>
            <span>Nombre completo</span>
            <input type="text" formControlName="name" placeholder="Tu nombre" autocomplete="name">
          </label>

          <label>
            <span>Correo electronico</span>
            <input type="email" formControlName="email" placeholder="correo@ejemplo.com" autocomplete="email">
          </label>

          <label>
            <span>Telefono</span>
            <input type="tel" formControlName="phone" placeholder="Tu telefono" autocomplete="tel">
          </label>

          <label>
            <span>Contrasena</span>
            <input type="password" formControlName="password" placeholder="Minimo 6 caracteres" autocomplete="new-password">
          </label>

          <p *ngIf="registerMessage" class="login-success" role="status">{{ registerMessage }}</p>
          <p *ngIf="registerError" class="login-error" role="alert">{{ registerError }}</p>

          <button type="submit" [disabled]="registerForm.invalid || loading" class="login-submit">
            {{ loading ? 'Creando...' : 'Crear cuenta' }}
          </button>
        </form>
      </section>
    </main>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);

  mode: 'login' | 'register' = 'login';
  loading = false;
  loginError = '';
  registerError = '';
  registerMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get isRegisterMode() {
    return this.mode === 'register';
  }

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.clearLoginError();
    this.clearRegisterFeedback();
  }

  login() {
    this.clearLoginError();

    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.notifService.success('Bienvenido');
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loginError = this.getLoginErrorMessage(error);
        this.loginForm.controls.password.reset('');
        this.notifService.error(this.loginError);
        this.loading = false;
      }
    });
  }

  clearLoginError() {
    this.loginError = '';
  }

  showLoginFieldError(controlName: 'email' | 'password') {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private getLoginErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || error.error?.error || 'Correo o contrasena incorrectos.';
    }

    return 'Correo o contrasena incorrectos.';
  }

  register() {
    this.clearRegisterFeedback();

    if (this.registerForm.invalid || this.loading) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const value = this.registerForm.getRawValue();

    this.authService.register({
      name: value.name!,
      email: value.email!,
      phone: value.phone!,
      password: value.password!
    }).subscribe({
      next: () => {
        this.registerMessage = 'Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesion.';
        this.notifService.success('Revisa tu correo para confirmar tu cuenta');
        this.registerForm.reset();
        this.loading = false;
      },
      error: (error: unknown) => {
        this.registerError = this.getRegisterErrorMessage(error);
        this.notifService.error(this.registerError);
        this.loading = false;
      }
    });
  }

  clearRegisterFeedback() {
    this.registerError = '';
    this.registerMessage = '';
  }

  private getRegisterErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || 'No se pudo crear la cuenta';
    }

    return 'No se pudo crear la cuenta';
  }
}
