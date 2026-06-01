import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogService } from '../../../core/services/log.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div>
        <p class="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Auditoría</p>
        <h2 class="text-3xl font-black text-[var(--text)]">Bitácora de actividad</h2>
        <p class="text-sm text-[var(--text-soft)] mt-1">Historial de acciones registradas en el sistema.</p>
      </div>

      <div class="glass-card p-4 overflow-x-auto">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs$ | async">
              <td class="text-sm font-medium text-[var(--text-soft)] w-48">{{ log.timestamp | date:'short' }}</td>
              <td class="font-bold text-blue-600">{{ log.userName }}</td>
              <td>
                <span class="status-badge"
                      [ngClass]="{
                        'bg-emerald-500/10 text-emerald-700 border-emerald-500/40': log.action === 'creación' || log.action === 'login',
                        'bg-red-500/10 text-red-700 border-red-500/40': log.action === 'cancelación' || log.action === 'logout',
                        'bg-blue-500/10 text-blue-700 border-blue-500/40': log.action === 'edición'
                      }">
                  {{ log.action | uppercase }}
                </span>
                <span class="text-xs text-[var(--text-soft)] ml-2 font-medium">en {{ log.entity }}</span>
              </td>
              <td class="text-sm text-[var(--text)]">{{ log.details }}</td>
            </tr>
            <tr *ngIf="(logs$ | async)?.length === 0">
              <td colspan="4" class="py-6">
                <div class="empty-state">
                  <span class="material-symbols-rounded text-[44px] mb-3 text-[var(--text-soft)]">history_toggle_off</span>
                  <p class="text-lg font-semibold">No hay registros recientes.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class LogsComponent {
  logs$ = inject(LogService).logs$;
}
