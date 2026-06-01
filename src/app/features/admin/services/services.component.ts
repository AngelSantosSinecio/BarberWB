import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BarberServiceItem } from '../../../core/models/service.model';
import { ServicesApiService } from '../../../core/services/services-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-services-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <p class="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Catálogo</p>
          <h2 class="text-3xl font-black text-[var(--text)]">Servicios</h2>
          <p class="text-sm text-[var(--text-soft)] mt-1">Administra precios, duración y disponibilidad.</p>
        </div>
        <button (click)="openCreate()" class="premium-btn">
          <span class="material-symbols-rounded text-[20px]">add</span>
          Nuevo servicio
        </button>
      </div>

      <div class="glass-card p-4 overflow-x-auto">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Duración</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let service of services">
              <td class="font-semibold text-[var(--text)]">{{ service.name }}</td>
              <td class="text-[var(--text-soft)]">{{ service.duration_minutes }} min</td>
              <td class="font-bold text-[var(--text)]">\${{ service.price }}</td>
              <td>
                <span class="status-badge"
                      [ngClass]="service.active ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/40' : 'bg-slate-500/10 text-slate-600 border-slate-500/40'">
                  {{ service.active ? 'ACTIVO' : 'INACTIVO' }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button (click)="openEdit(service)" class="premium-btn-outline px-3 py-2 text-sm">Editar</button>
                  <button (click)="deleteService(service)" class="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">Desactivar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass-card w-full max-w-md p-6 border border-[var(--border)] shadow-2xl">
          <h3 class="text-2xl font-extrabold mb-6 text-[var(--text)]">{{ editingService ? 'Editar' : 'Nuevo' }} servicio</h3>

          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1.5">Nombre</label>
              <input formControlName="name" class="premium-input">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Duración en minutos</label>
              <input formControlName="durationMinutes" type="number" min="1" class="premium-input">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Precio</label>
              <input formControlName="price" type="number" min="1" class="premium-input">
            </div>
            <label class="flex items-center gap-2 text-sm font-semibold">
              <input formControlName="active" type="checkbox">
              Servicio activo
            </label>

            <div class="flex justify-end gap-3 mt-8">
              <button type="button" (click)="showModal = false" class="premium-btn-outline">Cancelar</button>
              <button type="submit" [disabled]="form.invalid || saving" class="premium-btn">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ServicesComponent implements OnInit {
  private servicesApi = inject(ServicesApiService);
  private fb = inject(FormBuilder);
  private notif = inject(NotificationService);
  private uiService = inject(UiService);

  services: BarberServiceItem[] = [];
  showModal = false;
  editingService: BarberServiceItem | null = null;
  saving = false;

  form = this.fb.group({
    name: ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    price: [100, [Validators.required, Validators.min(1)]],
    active: [true]
  });

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.servicesApi.getServices().subscribe({
      next: (services) => this.services = services,
      error: (error) => this.notif.error(error?.error?.message || 'No se pudieron cargar los servicios')
    });
  }

  openCreate() {
    this.editingService = null;
    this.saving = false;
    this.form.reset({ name: '', durationMinutes: 30, price: 100, active: true });
    this.showModal = true;
  }

  openEdit(service: BarberServiceItem) {
    this.editingService = service;
    this.saving = false;
    this.form.reset({
      name: service.name,
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
      active: Boolean(service.active)
    });
    this.showModal = true;
  }

  save() {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const body = {
      name: value.name!,
      durationMinutes: Number(value.durationMinutes),
      price: Number(value.price)
    };

    const request$ = this.editingService
      ? this.servicesApi.updateService(this.editingService.id, { ...body, active: Boolean(value.active) })
      : this.servicesApi.createService(body);

    this.saving = true;

    request$.subscribe({
      next: () => {
        this.notif.success('Servicio guardado correctamente');
        this.saving = false;
        this.showModal = false;
        this.loadServices();
      },
      error: (error) => {
        this.notif.error(error?.error?.message || 'No se pudo guardar el servicio');
        this.saving = false;
      }
    });
  }

  async deleteService(service: BarberServiceItem) {
    const ok = await this.uiService.confirm({
      title: 'Desactivar servicio',
      message: `¿Deseas desactivar ${service.name}?`,
      confirmText: 'Desactivar',
      tone: 'danger'
    });

    if (!ok) return;

    this.servicesApi.deleteService(service.id).subscribe({
      next: () => {
        this.notif.info('Servicio desactivado');
        this.loadServices();
      },
      error: (error) => this.notif.error(error?.error?.message || 'No se pudo desactivar el servicio')
    });
  }
}
