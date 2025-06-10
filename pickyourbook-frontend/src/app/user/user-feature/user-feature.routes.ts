import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'all-books',
    loadComponent: () => import('./all-books/all-books.component').then(m => m.AllBooksComponent)
  },
  {
    path: 'sell-here',
    loadChildren: () => import('./sell-here/sell-here.routes').then(m => m.SELL_HERE_ROUTES)
  },
  {
    path: 'book/:id',
    loadComponent: () => import('./book-details/book-details.component').then(m => m.BookDetailsComponent)
  },
  {
    path: 'messaging',
    loadChildren: () => import('./messaging/messaging.route').then(m => m.messagingRoutes)
  }
];
