import { Injectable, signal } from '@angular/core';

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  tone: 'default' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class UiService {
  private loadingCounter = signal(0);
  readonly isLoading = signal(false);

  readonly confirmDialog = signal<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    tone: 'default'
  });

  private resolver: ((value: boolean) => void) | null = null;

  showLoading() {
    this.loadingCounter.update(v => v + 1);
    this.isLoading.set(this.loadingCounter() > 0);
  }

  hideLoading() {
    this.loadingCounter.update(v => Math.max(v - 1, 0));
    this.isLoading.set(this.loadingCounter() > 0);
  }

  confirm(config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    tone?: 'default' | 'danger';
  }): Promise<boolean> {
    this.confirmDialog.set({
      open: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText ?? 'Confirmar',
      cancelText: config.cancelText ?? 'Cancelar',
      tone: config.tone ?? 'default'
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  resolveConfirm(value: boolean) {
    if (this.resolver) {
      this.resolver(value);
      this.resolver = null;
    }
    this.confirmDialog.set({
      ...this.confirmDialog(),
      open: false
    });
  }
}
