import { Component } from '@angular/core';
import { UserHeaderComponent } from "./user-layout/user-header/user-header.component";
import { UserFooterComponent } from "./user-layout/user-footer/user-footer.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { UserSidebarComponent } from "./user-layout/user-sidebar/user-sidebar.component";

@Component({
  selector: 'app-user-feature',
  standalone: true,
  imports: [UserHeaderComponent, UserFooterComponent, CommonModule, RouterModule, UserSidebarComponent],
  templateUrl: './user-feature.component.html',
  styleUrls: ['./user-feature.component.scss']
})
export class UserFeatureComponent {

isLoading: boolean = true;

constructor(private router: Router) {
  // Simulate loading process
  setTimeout(() => {
    this.isLoading = false; // Set to false once loading is complete
  }, 3500); // Adjust the timeout as needed
}

showSidebar() {
  return this.router.url.startsWith('/user-feature/all-books');
}

hideFooter() {
  return !this.router.url.startsWith('/user-feature/messaging');
}

isMessagingRoute(): boolean {
  return this.router.url.includes('/messaging');
}


}
