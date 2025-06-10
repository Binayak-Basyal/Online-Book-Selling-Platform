import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Define interfaces for API responses
interface AuthResponse {
  token: string;
  user: User;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  contact: string;
  address: string;
  gender?: string;
  profile_image?: string;
  is_admin: boolean;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Change from /api to match your actual API structure
  private apiUrl = 'http://localhost:8000/api';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<AuthResponse> {
    // Change endpoint to match your backend routes
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<AuthResponse> {
    // Change endpoint to match your backend routes
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            this.isLoggedInSubject.next(true);
          }
        }),
        catchError(error => {
          console.error('Login error', error);
          throw error;
        })
      );
  }


  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.post(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          this.isLoggedInSubject.next(false);
        })
      );
  }

  getUser(): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<User>(`${this.apiUrl}/user`, { headers });
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
