import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

type NavItem = {
  label: string;
  route: string;
  icon: string;
  roles: string[];
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-frame" [class.sidebar-open]="isSidebarOpen">
      <div
        *ngIf="isSidebarOpen"
        class="sidebar-backdrop"
        (click)="toggleSidebar()"
      ></div>

      <aside
        class="sidebar-panel"
      >
        <div class="px-5 py-5">
          <div class="flex items-center gap-3">
            <div class="brand-mark">
              <span class="material-symbols-rounded text-[25px]">content_cut</span>
            </div>
            <div>
              <h2 class="text-xl font-black tracking-tight text-white">BarberApp</h2>
              <p class="text-xs uppercase tracking-wider text-[var(--gold)]">{{ roleTitle }}</p>
            </div>
          </div>
        </div>

        <div class="mx-5 mb-4 barber-promo">
          <span class="material-symbols-rounded text-[28px]">workspace_premium</span>
          <div>
            <p class="text-sm font-black">{{ promoTitle }}</p>
            <p class="text-xs opacity-80">{{ promoText }}</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <p class="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-white/45">
            Menu
          </p>

          <a
            *ngFor="let item of visibleItems"
            [routerLink]="item.route"
            (click)="isSidebarOpen = false"
            routerLinkActive="is-active"
            class="side-link"
          >
            <span class="material-symbols-rounded text-[21px]">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center font-black text-[var(--gold)]">
              {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div class="flex-1 overflow-hidden">
              <p class="text-sm font-bold text-white truncate">{{ user?.name }}</p>
              <p class="text-xs text-white/55 capitalize">{{ user?.role }}</p>
            </div>
            <button (click)="logout()" class="icon-action" title="Cerrar sesion">
              <span class="material-symbols-rounded text-[20px]">logout</span>
            </button>
          </div>
          <button (click)="themeService.toggle()" class="theme-toggle">
            <span>{{ themeService.isDarkMode() ? 'Modo claro' : 'Modo oscuro' }}</span>
            <span class="material-symbols-rounded text-[20px]">
              {{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>
        </div>
      </aside>

      <main class="layout-main">
        <header class="layout-header">
          <div class="wrapper layout-header-inner">
            <button (click)="toggleSidebar()" class="premium-btn-outline menu-toggle">
              <span class="material-symbols-rounded text-[20px]">menu</span>
              Menu
            </button>
            <div class="layout-title">
              <p class="text-xs uppercase tracking-wider font-black text-[var(--gold)]">{{ roleTitle }}</p>
              <h1 class="text-lg font-black text-[var(--text)]">{{ pageTitle }}</h1>
            </div>
            <div class="layout-meta">
              <span class="material-symbols-rounded text-[18px] text-[var(--gold)]">schedule</span>
              Citas y servicios
            </div>
          </div>
        </header>

        <div class="wrapper page-shell pb-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  user = this.authService.currentUserValue;
  isSidebarOpen = true;

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard', roles: ['admin'] },
    { label: 'Barberos', route: '/admin/barbers', icon: 'group', roles: ['admin'] },
    { label: 'Usuarios', route: '/admin/users', icon: 'manage_accounts', roles: ['admin'] },
    { label: 'Servicios', route: '/admin/services', icon: 'content_cut', roles: ['admin'] },
    { label: 'Bitacora', route: '/admin/logs', icon: 'receipt_long', roles: ['admin'] },
    { label: 'Agenda', route: '/appointments/calendar', icon: 'calendar_month', roles: ['admin', 'barbero'] },
    { label: 'Agendar cita', route: '/appointments/create', icon: 'add_circle', roles: ['admin', 'cliente'] },
    { label: 'Mi historial', route: '/client/history', icon: 'event_note', roles: ['admin', 'cliente'] }
  ];

  get isAdmin() { return this.user?.role === 'admin'; }
  get isBarbero() { return this.user?.role === 'barbero'; }
  get isCliente() { return this.user?.role === 'cliente'; }

  get visibleItems() {
    return this.navItems.filter(item => item.roles.includes(this.user?.role || ''));
  }

  get roleTitle() {
    if (this.isAdmin) return 'Panel admin';
    if (this.isBarbero) return 'Panel barbero';
    return 'Panel cliente';
  }

  get pageTitle() {
    if (this.isAdmin) return 'Control de barberia';
    if (this.isBarbero) return 'Agenda de trabajo';
    return 'Reservas y visitas';
  }

  get promoTitle() {
    if (this.isAdmin) return 'Gestion completa';
    if (this.isBarbero) return 'Turnos del dia';
    return 'Reserva facil';
  }

  get promoText() {
    if (this.isAdmin) return 'Equipo, servicios y reportes.';
    if (this.isBarbero) return 'Confirma citas.';
    return 'Elige servicio y horario.';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }
}
