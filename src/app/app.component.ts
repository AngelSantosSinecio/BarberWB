import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/ui/toast/toast.component';
import { ThemeService } from './core/services/theme.service';
import { LoaderComponent } from './shared/components/ui/loader/loader.component';
import { UiService } from './core/services/ui.service';
import { ConfirmModalComponent } from './shared/components/ui/confirm-modal/confirm-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent, LoaderComponent, ConfirmModalComponent],
  template: `
    <div class="min-h-screen text-[var(--text)] transition-colors duration-500">
      <app-loader *ngIf="uiService.isLoading()"></app-loader>
      <router-outlet></router-outlet>
      <app-toast></app-toast>
      <app-confirm-modal></app-confirm-modal>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'barberapp';
  themeService = inject(ThemeService);
  uiService = inject(UiService);
}
