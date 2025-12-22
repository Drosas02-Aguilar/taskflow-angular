import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  
  {
    path: 'auth/login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login/login.component')
      .then(modulo => modulo.LoginComponent)
  },
  {
    path: 'auth/register',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/register/register.component')
      .then(modulo => modulo.RegisterComponent)
  },
  {
    path: 'auth/forgot',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
      .then(modulo => modulo.ForgotPasswordComponent)
  },
  {
    path: 'auth/reset',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/reset-password/reset-password.component')
      .then(modulo => modulo.ResetPasswordComponent)
  },
  {
    path: 'auth/change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/change-password/change-password.component')
      .then(modulo => modulo.ChangePasswordComponent)
  }
  ,
  {
    path: 'auth/verify',
    loadComponent: () => import('./features/auth/verify/verify.component')
      .then(modulo => modulo.VerifyComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(modulo => modulo.DashboardComponent)
  },
  {
    path: 'tareas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tareas/lista-tareas/lista-tareas.component')
      .then(modulo => modulo.ListaTareasComponent)
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
  // {
  //   path: 'usuario/perfil',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/usuario/perfil/perfil.component')
  //     .then(m => m.PerfilComponent)
  // },
  // {
  //   path: 'usuario/editar',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/usuario/editar/editar.component')
  //     .then(m => m.EditarComponent)
  // },
  
  { path: '**', redirectTo: '/auth/login' }
];