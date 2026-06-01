import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UiService } from '../../../core/services/ui.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <p class="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Accesos</p>
          <h2 class="text-3xl font-black text-[var(--text)]">Gestion de usuarios</h2>
          <p class="text-sm text-[var(--text-soft)] mt-1">Bloquea cuentas o elimina usuarios registrados.</p>
        </div>
      </div>

      <div class="glass-card p-4 overflow-x-auto">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users$ | async">
              <td class="font-semibold text-[var(--text)]">{{ user.name }}</td>
              <td class="text-[var(--text-soft)]">{{ user.email }}</td>
              <td>
                <span class="status-pill">{{ user.role }}</span>
              </td>
              <td>
                <span class="status-pill" [class.status-warning]="!user.email_verified">
                  {{ user.email_verified ? 'Verificado' : 'Pendiente' }}
                </span>
              </td>
              <td>
                <span class="status-pill" [class.status-danger]="!user.active">
                  {{ user.active ? 'Activo' : 'Bloqueado' }}
                </span>
              </td>
              <td>
                <div class="flex flex-wrap gap-2">
                  <button
                    (click)="toggleActive(user)"
                    [disabled]="isCurrentUser(user) || busyId === user.id"
                    class="premium-btn-outline px-3 py-2 text-sm"
                  >
                    {{ user.active ? 'Bloquear' : 'Desbloquear' }}
                  </button>
                  <button
                    (click)="deleteUser(user)"
                    [disabled]="isCurrentUser(user) || busyId === user.id"
                    class="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UsersComponent {
  private readonly userService = inject(UserService);
  private readonly uiService = inject(UiService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  users$ = this.userService.users$;
  busyId = '';

  isCurrentUser(user: User) {
    return String(user.id) === String(this.authService.currentUserValue?.id);
  }

  async toggleActive(user: User) {
    const willActivate = !user.active;
    const ok = await this.uiService.confirm({
      title: willActivate ? 'Desbloquear usuario' : 'Bloquear usuario',
      message: willActivate
        ? `¿Quieres permitir que ${user.name} vuelva a iniciar sesion?`
        : `¿Quieres bloquear el acceso de ${user.name}?`,
      confirmText: willActivate ? 'Desbloquear' : 'Bloquear',
      tone: willActivate ? 'default' : 'danger'
    });

    if (!ok) return;

    this.busyId = user.id;
    this.userService.setActive(user.id, willActivate).subscribe({
      next: () => {
        this.notificationService.success(willActivate ? 'Usuario desbloqueado' : 'Usuario bloqueado');
        this.busyId = '';
      },
      error: (error) => {
        this.notificationService.error(error?.error?.message || 'No se pudo actualizar el usuario');
        this.busyId = '';
      }
    });
  }

  async deleteUser(user: User) {
    const ok = await this.uiService.confirm({
      title: 'Eliminar usuario',
      message: `¿Seguro que deseas eliminar a ${user.name}? Tambien se eliminaran sus citas relacionadas.`,
      confirmText: 'Eliminar',
      tone: 'danger'
    });

    if (!ok) return;

    this.busyId = user.id;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.notificationService.info('Usuario eliminado');
        this.busyId = '';
      },
      error: (error) => {
        this.notificationService.error(error?.error?.message || 'No se pudo eliminar el usuario');
        this.busyId = '';
      }
    });
  }
}
