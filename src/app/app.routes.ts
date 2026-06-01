import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  { path: 'auth/login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/verify-email', loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
  { path: 'appointments/confirm', loadComponent: () => import('./features/appointments/email-confirmation/email-confirmation.component').then(m => m.EmailConfirmationComponent) },
  {
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
      
      // Admin only
      { 
        path: 'admin/dashboard', 
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard(['admin'])] 
      },
      { 
        path: 'admin/barbers', 
        loadComponent: () => import('./features/admin/barbers/barbers.component').then(m => m.BarbersComponent),
        canActivate: [roleGuard(['admin'])] 
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent),
        canActivate: [roleGuard(['admin'])]
      },
      {
        path: 'admin/services',
        loadComponent: () => import('./features/admin/services/services.component').then(m => m.ServicesComponent),
        canActivate: [roleGuard(['admin'])]
      },
      { 
        path: 'admin/logs', 
        loadComponent: () => import('./features/admin/logs/logs.component').then(m => m.LogsComponent),
        canActivate: [roleGuard(['admin'])] 
      },

      // Admin + Barbero
      { 
        path: 'appointments/calendar', 
        loadComponent: () => import('./features/appointments/calendar/calendar.component').then(m => m.CalendarComponent),
        canActivate: [roleGuard(['admin', 'barbero'])] 
      },

      // All authenticated
      { 
        path: 'appointments/create', 
        loadComponent: () => import('./features/appointments/create-appointment/create-appointment.component').then(m => m.CreateAppointmentComponent) 
      },
      { 
        path: 'client/history', 
        loadComponent: () => import('./features/client/history/history.component').then(m => m.ClientHistoryComponent) 
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
