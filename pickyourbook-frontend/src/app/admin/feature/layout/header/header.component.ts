import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

interface User {
  id: number;
  full_name: string;
  email: string;
  contact: string;
  address: string;
  is_admin: boolean;
  user_pic?: string;
  status?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    this.authService.getUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        this.user = null;
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Redirect to login page after successful logout
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        // Handle logout error
        console.error('Logout failed', err);
      }
    });
  }
}
