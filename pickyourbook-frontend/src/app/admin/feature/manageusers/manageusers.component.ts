import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserStatus } from '../../../shared/enum/userStatus';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-manageusers',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './manageusers.component.html',
  styleUrl: './manageusers.component.scss',
})
export class ManageusersComponent implements OnInit {
  acceptedUsers: User[] = [];
  pendingUsers: User[] = [];
  rejectedUsers: User[] = [];
  deletedUsers: User[] = [];
  loading = true;
  searchTerm = '';
  currentPage = 1;
  users: User[] = [];
  error: string | null = null;
  user: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    // Get token from localStorage
    const token = localStorage.getItem('token'); // Make sure this matches what you store in auth.service.ts

    // Create headers with authorization token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Use the admin route as specified in your API
    this.http.get<{ users: User[] }>('http://localhost:8000/api/admin/users', { headers })
      .subscribe({
        next: (data) => {
          if (data && Array.isArray(data.users)) {
            this.users = data.users.map(user => ({
              ...user
            }));

            // Filter users by status using the enum values
            this.pendingUsers = this.users.filter(user => user.status === UserStatus.Pending);
            this.acceptedUsers = this.users.filter(user => user.status === UserStatus.Accepted);
            this.rejectedUsers = this.users.filter(user => user.status === UserStatus.Rejected);

            this.loading = false;
          } else {
            this.error = 'Invalid data structure received from API';
            this.loading = false;
          }
        },
        error: (error) => {
          this.error = 'Error loading users: ' + (error.message || 'Unknown error');
          this.loading = false;
          console.error('Error loading users:', error);
        }
      });
  }

  updateUserStatus(userId: number, status: string): void {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Convert the status text to the proper enum value
    let statusValue: string;
    switch (status) {
      case 'Accepted':
        statusValue = UserStatus.Accepted;
        break;
      case 'Rejected':
        statusValue = UserStatus.Rejected;
        break;
      default:
        statusValue = UserStatus.Pending;
    }

    this.http.put(`http://localhost:8000/api/admin/users/${userId}/status`,
      { status: statusValue },
      { headers })
      .subscribe({
        next: (response: any) => {
          // After successful update, refresh the user lists
          this.loadUsers();
        },
        error: (error) => {
          this.error = `Error updating user status: ${error.message || 'Unknown error'}`;
          console.error('Error updating user status:', error);
        }
      });
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm) return this.users;

    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      user.full_name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }
}