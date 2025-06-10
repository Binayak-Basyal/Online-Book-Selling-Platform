import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      
      // Create the user object with the exact field names expected by your Laravel API
      const newUser = {
        full_name: this.signupForm.value.full_name,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        password_confirmation: this.signupForm.value.confirmPassword,
        contact: this.signupForm.value.contact,
        address: this.signupForm.value.address
      };

      console.log('Sending registration data:', newUser);

      this.authService.register(newUser).subscribe({
        next: (response) => {
          console.log('User registered successfully:', response);
          this.isSubmitting = false;
          alert('Account created successfully! Please login.');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Error registering user:', error);
          
          if (error.error && error.error.errors) {
            // Handle validation errors from Laravel
            const validationErrors = error.error.errors;
            const firstError = Object.values(validationErrors)[0];
            this.errorMessage = Array.isArray(firstError) ? firstError[0] : 'Validation error';
          } else {
            this.errorMessage = error.error?.message || 'Failed to create account. Please try again.';
          }
          
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Please fix the errors in the form.';
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === '' || event.code === 'Space') {
      event.preventDefault();
    }
  }
}
