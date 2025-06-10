import { Component, OnInit } from '@angular/core';
import { BookService, Book } from 'src/app/services/book.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { CategoryService } from 'src/app/services/category.service';
import { AuthService } from 'src/app/services/auth.service'; // Import if not already

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss'
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null;
  bookId!: number;
  categories: any[] = [];
  subcategories: any[] = [];
  subsubcategories: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private bookService: BookService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Load categories data
    this.loadCategories();

    // Get book ID from route parameter
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bookId = +idParam;
      this.loadBook();
    } else {
      this.router.navigate(['/user-feature/all-books']);
    }
  }

  loadBook() {
    this.bookService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.book = book;
      },
      error: (err) => {
        console.error('Error loading book details:', err);
        this.router.navigate(['/user-feature/all-books']);
      }
    });
  }

  loadCategories() {
    this.categoryService.getcategories().subscribe(categories => {
      this.categories = categories;

      this.categoryService.getsubcategories().subscribe(subcategories => {
        this.subcategories = subcategories;

        this.categoryService.getsubsubcategories().subscribe(subsubcategories => {
          this.subsubcategories = subsubcategories;
        });
      });
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.category_name : 'Unknown Category';
  }

  getSubcategoryName(subcategoryId: number): string {
    const subcategory = this.subcategories.find(s => s.id === subcategoryId);
    return subcategory ? subcategory.subcategory_name : 'Unknown Subcategory';
  }

  getSubsubcategoryName(subsubcategoryId: number): string {
    const subsubcategory = this.subsubcategories.find(s => s.id === subsubcategoryId);
    return subsubcategory ? subsubcategory.subsubcategory_name : 'Unknown Subsubcategory';
  }

  getImageUrl(): string {
    if (!this.book) return '';
    return this.bookService.getBookImageUrl(this.book);
  }

  getMaskedEmail(email: string): string {
    // Show first 2 characters and domain, mask the rest
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;

    return `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`;
  }

  goBack(): void {
    this.location.back();
  }

  contactSeller(): void {
    if (!this.book) {
      console.error('No book data available');
      return;
    }
    this.authService.getUser().subscribe({
      next: (user) => {
        const sender = user?.email;

        if (!sender) {
          console.error('Current user has no email');
          return;
        }
        const receiver = this.book?.owner_email;
        // Safely access the full_name property
        let receiverName = 'Seller';
        if (this.book?.owner && this.book.owner.full_name) {
          receiverName = this.book.owner.full_name;
        }
        this.router.navigate(['/user-feature/messaging'], {
          queryParams: {
            sender,
            receiver,
            receiverName
          }
        });
      },
      error: (err) => {
        console.error('Failed to get user details:', err);
      }
    });
  }
}


