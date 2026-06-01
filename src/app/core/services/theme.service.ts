import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkModeSignal = signal<boolean>(false);

  constructor() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved === 'dark') {
      this.darkModeSignal.set(true);
    } else if (!saved && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkModeSignal.set(true);
    }

    effect(() => {
      const isDark = this.darkModeSignal();
      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark');
          if (typeof localStorage !== 'undefined') localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          if (typeof localStorage !== 'undefined') localStorage.setItem('theme', 'light');
        }
      }
    });
  }

  toggle() {
    this.darkModeSignal.update(val => !val);
  }

  isDarkMode() {
    return this.darkModeSignal();
  }
}
