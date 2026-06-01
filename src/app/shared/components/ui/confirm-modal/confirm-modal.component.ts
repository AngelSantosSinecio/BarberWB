import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../../core/services/ui.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="dialog().open" class="confirm-modal-overlay">
      <div class="confirm-modal-card" role="dialog" aria-modal="true">
        <h3>{{ dialog().title }}</h3>
        <p>{{ dialog().message }}</p>

        <div class="confirm-modal-actions">
          <button type="button" class="premium-btn-outline" (click)="resolve(false)">
            {{ dialog().cancelText }}
          </button>
          <button
            type="button"
            class="confirm-modal-primary"
            [class.confirm-modal-primary--danger]="dialog().tone === 'danger'"
            (click)="resolve(true)"
          >
            {{ dialog().confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  uiService = inject(UiService);
  dialog = this.uiService.confirmDialog;

  resolve(value: boolean) {
    this.uiService.resolveConfirm(value);
  }
}
