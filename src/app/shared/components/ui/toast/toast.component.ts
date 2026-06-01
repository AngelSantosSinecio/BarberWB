import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification() as notif" 
         class="fixed bottom-6 right-6 z-[100] p-4 pr-6 rounded-2xl shadow-2xl transition-all transform animate-fade-in flex items-center gap-4 glass-card border min-w-[300px] max-w-[92vw]"
         [ngClass]="{
           'border-emerald-500 bg-emerald-500/10 dark:bg-[#121212]/90': notif.type === 'success',
           'border-red-500 bg-red-500/10 dark:bg-[#121212]/90': notif.type === 'error',
           'border-[#007FFF] bg-[#007FFF]/10 dark:bg-[#121212]/90': notif.type === 'info',
           'border-[#D4AF37] bg-[#D4AF37]/10 dark:bg-[#121212]/90': notif.type === 'warning'
         }">
      
      <div class="p-2 rounded-xl text-white"
           [ngClass]="{
             'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]': notif.type === 'success',
             'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]': notif.type === 'error',
             'bg-[#007FFF] shadow-[0_0_15px_rgba(0,127,255,0.5)]': notif.type === 'info',
             'bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.5)]': notif.type === 'warning'
           }">
        <span *ngIf="notif.type === 'success'" class="material-symbols-rounded text-[24px]">check_circle</span>
        <span *ngIf="notif.type === 'error'" class="material-symbols-rounded text-[24px]">cancel</span>
        <span *ngIf="notif.type === 'info'" class="material-symbols-rounded text-[24px]">info</span>
        <span *ngIf="notif.type === 'warning'" class="material-symbols-rounded text-[24px]">warning</span>
      </div>

      <div class="flex flex-col">
        <span class="font-bold text-[var(--text)] text-sm capitalize">{{ notif.type === 'error' ? 'Error' : (notif.type === 'success' ? 'Éxito' : notif.type) }}</span>
        <span class="text-[var(--text-soft)] text-sm font-medium">{{ notif.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
  notification = this.notificationService.toast;
}
