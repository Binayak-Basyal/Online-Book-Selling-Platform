import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { FeatureComponent } from './admin/feature/feature.component';
import { UserFeatureComponent } from './user/user-feature/user-feature.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthComponent,
    loadChildren: () => import('./auth/auth.routes').then((m) => m.routes),
  },
  {
    path: 'feature',
    component: FeatureComponent,
    loadChildren: () => import('./admin/feature/feature.routes').then((m) => m.routes),
  },
  {
    path: 'user-feature',
    component: UserFeatureComponent,
    loadChildren: () => import('./user/user-feature/user-feature.routes').then((m) => m.routes), 
  }


];