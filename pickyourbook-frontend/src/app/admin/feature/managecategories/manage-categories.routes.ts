import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'all-categories', pathMatch: 'full' },
  { 
    path: 'all-categories', 
    loadComponent: () => import('./all-categories/all-categories.component').then(m => m.AllCategoriesComponent)
  },
  { 
    path: 'add-categories', 
    loadComponent: () => import('./add-categories/add-categories.component').then(m => m.AddCategoriesComponent)
  }
];
