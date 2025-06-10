import { Routes } from '@angular/router';
import { SellHereComponent } from './sell-here.component';

export const SELL_HERE_ROUTES: Routes = [
  {
    path: '',
    component: SellHereComponent,
    children: [
      { path: 'add-book', component: SellHereComponent },
      { path: 'edit-book/:id', component: SellHereComponent },
      { path: 'view-book/:id', component: SellHereComponent }
    ]
  }
];
