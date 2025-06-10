import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { routes } from './manage-categories.routes';

@Component({
  selector: 'app-managecategories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './managecategories.component.html',
  styleUrl: './managecategories.component.scss'
})
export class ManagecategoriesComponent {
[x: string]: any;
constructor(public router: Router) {}

}