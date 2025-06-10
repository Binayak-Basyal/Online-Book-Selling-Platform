import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        remember: this.loginForm.value.remember
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isSubmitting = false;

          if (response && response.token) {
            // Store the token in localStorage
            localStorage.setItem('token', response.token);

            // Now fetch the user data using the token
            this.authService.getUser().subscribe({
              next: (userData) => {
                // Store user data
                localStorage.setItem('userData', JSON.stringify(userData));

                // Navigate based on user role
                if (userData && userData.is_admin) {
                  this.router.navigate(['/feature']);
                } else {
                  this.router.navigate(['/user-feature']);
                }
              },
              error: (err) => {
                console.error('Error fetching user data:', err);
                // If we can't get user data, just navigate to a default dashboard
                this.router.navigate(['/dashboard']);
              }
            });
          } else {
            // If no token in response, navigate to a default route
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = error.error?.message || 'Invalid email or password';
          this.isSubmitting = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly';
    }
  }

  // Add the missing onKeydown method
  onKeydown(event: KeyboardEvent): void {
    // Prevent spaces in input fields if needed
    if (event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
    }
  }
}
