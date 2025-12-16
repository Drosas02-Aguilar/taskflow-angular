import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  
  {
    path: 'auth/login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'auth/forgot',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'auth/reset',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent)
  },
  {
    path: 'auth/verify',
    loadComponent: () => import('./features/auth/verify/verify.component')
      .then(m => m.VerifyComponent)
  },
  
  {
    path: 'auth/change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/change-password/change-password.component')
      .then(m => m.ChangePasswordComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'tareas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tareas/lista-tareas/lista-tareas.component')
      .then(m => m.ListaTareasComponent)
  },
  {
    path: 'tareas/nueva',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tareas/tarea-form/tarea-form.component')
      .then(m => m.TareaFormComponent)
  },
  {
    path: 'tareas/editar/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tareas/tarea-form/tarea-form.component')
      .then(m => m.TareaFormComponent)
  },
  {
    path: 'usuario/perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/usuario/perfil/perfil.component')
      .then(m => m.PerfilComponent)
  },
  {
    path: 'usuario/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/usuario/editar/editar.component')
      .then(m => m.EditarComponent)
  },
  
  { path: '**', redirectTo: '/auth/login' }
];