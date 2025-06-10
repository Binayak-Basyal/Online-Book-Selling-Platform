import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookService, Book } from 'src/app/services/book.service';
import { FilterService } from 'src/app/services/filter.service';
import { AuthService } from 'src/app/services/auth.service'; // Add this import
import { Subscription, Observable } from 'rxjs';
import { UserHeaderComponent } from '../user-layout/user-header/user-header.component';

@Component({
  selector: 'app-all-books',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './all-books.component.html',
  styleUrl: './all-books.component.scss'
})
export class AllBooksComponent implements OnInit, OnDestroy {
  isLoading = false;
  books: Book[] = [];
  allBooks: Book[] = [];
  filteredBooks: Book[] = [];
  currentUserEmail: string | null = null;
  private filterSubscription: Subscription | undefined;
  private searchSub!: Subscription;
  searchTerm: string = '';
  itemToShow = 16;
  loadIncrement = 8;


  constructor(
    private bookService: BookService,
    private router: Router,
    private filterService: FilterService,
    private authService: AuthService
  ) { }


  ngOnInit(): void {
    this.getCurrentUserEmail();
    this.filterSubscription = this.filterService.currentFilterCriteria.subscribe(criteria => {
      this.applyFilters(criteria);
    });


    this.searchSub = this.filterService.searchTerm$.subscribe(term => {
      this.searchTerm = term || '';
      if (!term) {
        this.filteredBooks = this.books;
      } else {
        const searchTerm = term.toLowerCase();
        this.filteredBooks = this.books.filter(book =>
          book.book_name?.toLowerCase().includes(searchTerm)
        );
      }
    });
  }

  getCurrentUserEmail(): void {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData && userData.email) {
          this.currentUserEmail = userData.email;
          this.loadAllBooks();
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
          this.loadAllBooks();
        } else {
          this.loadAllBooks();
        }
      },
      error: (error) => {
        console.error('Error getting user from auth service:', error);
        this.loadAllBooks();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    this.searchSub?.unsubscribe();
  }

  loadAllBooks(): void {
    this.isLoading = true;
    this.bookService.getBooks().subscribe({
      next: (data) => {
        if (this.currentUserEmail) {
          this.books = data.filter(book => book.owner_email !== this.currentUserEmail);
        } else {
          this.books = data;
        }

        this.filteredBooks = this.books.slice(0, this.itemToShow);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching books:', error);
        this.books = [];
        this.filteredBooks = [];
        this.isLoading = false;
      }
    });
  }

  applyFilters(criteria: any): void {
    if (!criteria || Object.keys(criteria).length === 0) {
      this.filteredBooks = this.books;
      return;
    }

    this.isLoading = true;
    const { categoryId, subcategoryId, subsubcategoryId } = criteria;

    let bookObservable: Observable<Book[]>;

    if (subsubcategoryId) {
      bookObservable = this.bookService.getBooksBySubsubcategory(subsubcategoryId);
    } else if (subcategoryId) {
      bookObservable = this.bookService.getBooksBySubcategory(subcategoryId);
    } else if (categoryId) {
      bookObservable = this.bookService.getBooksByCategory(categoryId);
    } else {
      bookObservable = this.bookService.getBooks();
    }

    bookObservable.subscribe({
      next: (data) => {
        // Filter out books owned by current user
        if (this.currentUserEmail) {
          this.filteredBooks = data.filter(book => book.owner_email !== this.currentUserEmail);
        } else {
          this.filteredBooks = data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching filtered books:', error);
        this.isLoading = false;
      }
    });
  }
  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.bottomReached() && !this.isLoading) {
      this.showMoreBooks()
    }
  }
  showMoreBooks(): void {
    if(this.itemToShow < this.books.length){
      this.isLoading = true;
      setTimeout(()=> {
        this.itemToShow += this.loadIncrement;
        this.filteredBooks = this.books.slice(0, this.itemToShow);
        this.isLoading = false;
      },300)
    }
  }

  bottomReached(): boolean {
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight -100;
  }

  getBookImageUrl(book: Book): string {
    return this.bookService.getBookImageUrl(book);
  }

  goToBookDetails(bookId: number): void {
    this.router.navigate(['/user-feature/book', bookId]);
  }
}

