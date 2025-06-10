import { Routes } from '@angular/router';
import { MessagingComponent } from './messaging.component';
import { UsersComponent } from './users/users.component';
import { MessagesComponent } from './messages/messages.component';


export const messagingRoutes: Routes = [
  {
    path: '',
    component: MessagingComponent,
    children: [
      { path: 'conversation/:id', component: MessagesComponent }
    ]
  }
];

