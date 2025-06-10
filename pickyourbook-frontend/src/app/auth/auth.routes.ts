import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'signup', pathMatch: 'full' },
  { 
    path: 'signup', 
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  }
];
