import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

interface User {
  id: number;
  full_name: string;
  email: string;
  status: string;
}

interface BookResponse {
  books: Book[];
}

interface Book {
  id: number;
  book_name: string;
  book_author: string;
}

@Component({
  selector: 'app-analytic',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './analytic.component.html',
  styleUrl: './analytic.component.scss'
})
export class AnalyticComponent implements OnInit {
  userCount: number = 0;
  bookCount: number = 0;
  loading: boolean = true;
  activeUserCount: number = 0;
  pendingUserCount: number = 0;
  recentUsers: User[] = [];
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchBooks();
  }

  fetchUsers(): void {
    this.loading = true;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Create headers with authorization token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<{users: User[]}>('http://localhost:8000/api/admin/users', { headers })
      .subscribe({
        next: (data) => {
          if (data && Array.isArray(data.users)) {
            this.userCount = data.users.length;
            
            // Count active (accepted) users
            this.activeUserCount = data.users.filter(user => user.status === '1').length;
            
            // Count pending users
            this.pendingUserCount = data.users.filter(user => user.status === '0').length;
            
            // Get most recent 5 users
            this.recentUsers = [...data.users]
              .sort((a, b) => b.id - a.id)
              .slice(0, 5);
            
            console.log('Users loaded:', this.userCount);
          } else {
            this.error = 'Invalid data structure received from API';
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error loading users: ' + (error.message || 'Unknown error');
          console.error('Error loading users:', error);
          this.loading = false;
        }
      });
  }

  fetchBooks(): void {
    this.http.get<BookResponse>('/books.json')
      .subscribe({
        next: (data) => {
          this.bookCount = data.books.length;
          console.log('Books loaded:', this.bookCount);
        },
        error: (error) => {
          console.error('Error loading books:', error);
        }
      });
  }
}
