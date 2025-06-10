import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FilterService } from 'src/app/services/filter.service';
import { FormGroup, FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Book } from 'src/app/services/book.service';

@Component({
  selector: 'app-user-header',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  standalone: true,
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent {
  bookSearchForm: FormGroup;
  isDropdownOpen = false;
  isSearchOpen = false;


  allbooks: Book[] = [];
  filteredBooks: Book[] = [];


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private filterService: FilterService,
    // private authService: AuthService
  ) {
    this.bookSearchForm = this.fb.group({
      search: ['']
    });
  }


  // toggleSearch() {
    // const searchValue = this.bookSearchForm.get('search')?.value;
    // if (!this.isSearchOpen || !searchValue.trim()) {
      // this.isSearchOpen = !this.isSearchOpen;
    // }
  // }

toggleSearch() {
  const searchValue = this.bookSearchForm.get('search')?.value;
  if (this.isSearchOpen && searchValue && searchValue.trim()) {
    // Act as onSubmit
    const searchTerm = searchValue.trim();
    this.filterService.setSearchTerm(searchTerm);
    this.router.navigate(['user-feature/all-books']);
    this.isSearchOpen = false;
    this.bookSearchForm.reset();
  } else {
    this.isSearchOpen = !this.isSearchOpen;
  }
}

  onSubmit() {
    const searchTerm = this.bookSearchForm.get('search')?.value;
    if (searchTerm) {
      this.filterService.setSearchTerm(searchTerm);
      this.router.navigate(['user-feature/all-books']);
      this.isSearchOpen = false;
      this.bookSearchForm.reset();
    } else {

      this.isSearchOpen = false;
      this.bookSearchForm.reset();
    }
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    // Navigate to login page
    window.location.href = '/auth/login';
  }

  goToMessages(): void {
    this.router.navigate(['/user-feature/messaging']);
  }

}
