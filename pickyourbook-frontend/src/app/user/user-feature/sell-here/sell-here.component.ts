import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from 'src/app/services/book.service';
import { AuthService } from 'src/app/services/auth.service';
import { AddBooksComponent } from "./add-books/add-books.component";

@Component({
  selector: 'app-sell-here',
  standalone: true,
  imports: [CommonModule, RouterModule, AddBooksComponent],
  templateUrl: './sell-here.component.html',
  styleUrl: './sell-here.component.scss'
})
export class SellHereComponent implements OnInit {
  showAddBookPopup = false;
  books: any[] = [];
  showSuccessMessage = false;
  successMessage = '';
  isLoading = false;
  errorMessage = '';
  currentUserEmail: string | null = null;
  showSuccessToast = false;
  selectedBook: any = null;
  popupMode: 'add' | 'edit' | 'view' = 'add';

  constructor(
    private bookService: BookService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.getCurrentUserEmail(); 
  }

  getCurrentUserEmail() {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData && userData.email) {
          console.log('Using email from localStorage:', userData.email);
          this.currentUserEmail = userData.email;
          this.loadUserBooks();
          return;
        }
      } catch (e) {
        console.error('Error parsing userData from localStorage:', e);
      }
    }

    this.authService.getUser().subscribe({
      next: (user) => {
        if (user && user.email) {
          this.currentUserEmail = user.email;
          this.loadUserBooks();
        } else {
          this.handleEmailError('User information is incomplete.');
        }
      },
      error: (error) => {
        console.error('Error getting user from auth service:', error);
        this.handleEmailError('Could not retrieve your account information.');
      }
    });
  }


  handleEmailError(message: string) {
    this.errorMessage = message;
    this.isLoading = false;
  }

  loadUserBooks() {
    if (!this.currentUserEmail) {
      this.errorMessage = 'User email not available. Please log in again.';
      return;
    }

    this.isLoading = true;
    this.bookService.getUserBooks(this.currentUserEmail).subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.errorMessage = 'Failed to load your books. Please try again.';
        this.isLoading = false;
      }
    });
  }

  toggleAddBookPopup(mode: 'add' | 'edit' | 'view' | 'close', book?: any): void {
    if (mode === 'close') {
      this.showAddBookPopup = false;
      this.selectedBook = null;
      this.popupMode = 'add';
      return;
    }
    this.showAddBookPopup = true;
    this.popupMode = mode;
    this.selectedBook = book || null;
  }

  trackByBookId(index: number, book: any): number {
    return book.id;
  }

  onBookAdded(bookData: any) {
    if (bookData) {
      const existingIndex = this.books.findIndex(book => book.id === bookData.id);
      if (existingIndex !== -1) {
        this.books[existingIndex] = bookData;
        this.showSuccessMessage = true;
        this.successMessage = 'Book updated successfully!';
      } else {
        this.books.push(bookData);
        this.showSuccessMessage = true;
        this.successMessage = 'Book added successfully!';
      }
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
    this.showAddBookPopup = false;
  }

  viewBook(book: any) {
    this.toggleAddBookPopup('view', book);
  }

  editBook(book: any): void {
    this.toggleAddBookPopup('edit', book);
  }

  deleteBook(book: any) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(book.id).subscribe({
        next: () => {
          this.books = this.books.filter(b => b.id !== book.id);

          this.showSuccessMessage = true;
          this.successMessage = 'Book deleted successfully!';

          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          this.errorMessage = 'Failed to delete book. Please try again.';
        }
      });
    }
  }

  getBookImageUrl(book: any): string {
    if (!book || !book.book_image) {
      return 'assets/images/placeholder-book.png';
    }

    if (book.book_image.startsWith('http')) {
      return book.book_image;
    }

    const url = `http://localhost:8000/storage/${book.book_image}`;
    return url;
  }

}
