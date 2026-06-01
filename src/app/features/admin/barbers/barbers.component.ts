import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BarberService } from '../../../core/services/barber.service';
import { User } from '../../../core/models/user.model';
import { UiService } from '../../../core/services/ui.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <p class="text-sm uppercase tracking-wider font-bold text-blue-600 mb-1">Equipo</p>
          <h2 class="text-3xl font-black text-[var(--text)]">Gestión de barberos</h2>
          <p class="text-sm text-[var(--text-soft)] mt-1">Consulta el personal activo y sus especialidades.</p>
        </div>
        <button (click)="openForm()" class="premium-btn">
          <span class="material-symbols-rounded text-[20px]">person_add</span> Nuevo barbero
        </button>
      </div>

      <div class="glass-card p-4 overflow-x-auto">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Especialidades</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of barbers$ | async">
              <td class="font-semibold text-[var(--text)]">{{ b.name }}</td>
              <td class="text-[var(--text-soft)]">{{ b.email }}</td>
              <td>
                <span class="px-3 py-1 bg-[var(--surface-2)] text-[var(--text)] rounded-full text-xs font-semibold border border-[var(--border)]">{{ b.specialties?.join(', ') || 'N/A' }}</span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button (click)="edit(b)" class="premium-btn-outline px-3 py-2 text-sm">Editar</button>
                  <button (click)="delete(b.id)" class="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass-card w-full max-w-md p-6 border border-[var(--border)] shadow-2xl">
          <h3 class="text-2xl font-extrabold mb-6 text-[var(--text)]">{{ isEdit ? 'Editar' : 'Nuevo' }} barbero</h3>

          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <p *ngIf="formError" class="form-error" role="alert">{{ formError }}</p>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Nombre</label>
              <input formControlName="name" type="text" class="premium-input placeholder-gray-400" (input)="clearFormError()">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Email</label>
              <input formControlName="email" type="email" class="premium-input placeholder-gray-400" (input)="clearFormError()">
              <small *ngIf="form.controls.email.invalid && (form.controls.email.dirty || form.controls.email.touched)" class="field-error">
                Ingresa un correo valido.
              </small>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Teléfono</label>
              <input formControlName="phone" type="text" class="premium-input placeholder-gray-400" (input)="clearFormError()">
              <small *ngIf="form.controls.phone.invalid && (form.controls.phone.dirty || form.controls.phone.touched)" class="field-error">
                El telefono debe tener 10 digitos.
              </small>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1.5">Especialidades</label>
              <input formControlName="specialties" type="text" class="premium-input placeholder-gray-400">
            </div>

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
export class BarbersComponent {
  barberService = inject(BarberService);
  fb = inject(FormBuilder);
  uiService = inject(UiService);
  notificationService = inject(NotificationService);

  barbers$ = this.barberService.barbers$;
  showModal = false;
  isEdit = false;
  editId: string | null = null;
  saving = false;
  formError = '';

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    specialties: ['']
  });

  openForm() {
    this.isEdit = false;
    this.editId = null;
    this.form.reset();
    this.saving = false;
    this.formError = '';
    this.showModal = true;
  }

  edit(b: User) {
    this.isEdit = true;
    this.editId = b.id;
    this.form.patchValue({
      name: b.name,
      email: b.email,
      phone: b.phone,
      specialties: b.specialties?.join(', ') || ''
    });
    this.formError = '';
    this.saving = false;
    this.showModal = true;
  }

  async delete(id: string) {
    const ok = await this.uiService.confirm({
      title: 'Eliminar barbero',
      message: '¿Seguro que deseas eliminar este barbero?',
      confirmText: 'Eliminar',
      tone: 'danger'
    });
    if (!ok) return;

    this.barberService.deleteBarber(id).subscribe({
      next: () => this.notificationService.info('Barbero eliminado'),
      error: (error) => this.notificationService.error(error?.error?.message || 'No se pudo eliminar el barbero')
    });
  }

  save() {
    this.clearFormError();

    if(this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const specialties = val.specialties ? val.specialties.split(',').map(s => s.trim()) : [];

    const barber: User = {
      id: this.isEdit ? this.editId! : crypto.randomUUID(),
      role: 'barbero',
      name: val.name!,
      email: val.email!,
      phone: val.phone!,
      specialties
    };

    this.saving = true;
    const request$ = this.isEdit
      ? this.barberService.updateBarber(barber)
      : this.barberService.addBarber(barber);

    request$.subscribe({
      next: () => {
        this.notificationService.success(this.isEdit ? 'Barbero actualizado' : 'Barbero creado');
        this.saving = false;
        this.showModal = false;
      },
      error: (error) => {
        this.formError = error?.error?.message || 'No se pudo guardar el barbero';
        this.notificationService.error(this.formError);
        this.saving = false;
      }
    });
  }

  clearFormError() {
    this.formError = '';
  }
}
