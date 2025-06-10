import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'analytic', pathMatch: 'full' },
  { 
    path: 'analytic', 
    loadComponent: () => import('./analytic/analytic.component').then(m => m.AnalyticComponent)
  },
  { 
    path: 'manage-users', 
    loadComponent: () => import('./manageusers/manageusers.component').then(m => m.ManageusersComponent)
  },
  { 
    path: 'manage-books', 
    loadComponent: () => import('./managebooks/managebooks.component').then(m => m.ManagebooksComponent)
  },
  { 
    path: 'manage-categories', 
    loadComponent: () => import('./managecategories/managecategories.component').then(m => m.ManagecategoriesComponent),
    loadChildren: () => import('./managecategories/manage-categories.routes').then(m => m.routes)
  }
];

