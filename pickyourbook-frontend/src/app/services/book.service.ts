import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Add Book interface
export interface Book {
  id: number;
  book_name: string;
  book_author: string;
  book_publication: string;
  book_isbn: string;
  book_condition: string;
  book_price: number;
  book_image: string;
  category_id: number;
  subcategory_id?: number;
  subsubcategory_id?: number;
  owner_email: string;
  owner_id: number;
  owner?: {
    id: number;
    full_name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8000/api';


  constructor(private http: HttpClient) { }
  bookConditions = [
    { label: 'New', value: 'new' },
    { label: 'Used', value: 'used' }
  ];
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('BookService - Token for headers:', token); // Debug log

    if (!token) {
      console.error('No token found in localStorage'); // Debug log
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  addBook(bookData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('Making POST request to add book with headers:', headers); // Debug log
    return this.http.post(`${this.apiUrl}/books`, bookData, { headers });
  }

  updateBook(id: number, bookData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/books/${id}`, bookData, { headers });
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books`);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/books/${id}`);
  }

  deleteBook(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/books/${id}`, { headers });
  }

  // Add missing methods
  getBooksByCategory(categoryId: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/categories/${categoryId}/books`);
  }

  getBooksBySubcategory(subcategoryId: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/subcategories/${subcategoryId}/books`);
  }

  getBooksBySubsubcategory(subsubcategoryId: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/subsubcategories/${subsubcategoryId}/books`);
  }

  getUserBooks(ownerEmail: string): Observable<Book[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Book[]>(`${this.apiUrl}/owners/${ownerEmail}/books`, { headers });
  }
  getBooksByName(book_name: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books?book_name=${encodeURIComponent(book_name)}`);
  }

  getBooksByAuthor(book_author: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books?book_author=${encodeURIComponent(book_author)}`);
  }


  getBookImageUrl(book: Book): string {
    if (!book.book_image) {
      return '/assets/images/default-book.png'; // fallback image
    }

    // If the image is already a full URL, return it as is
    if (book.book_image.startsWith('http')) {
      return book.book_image;
    }

    // Otherwise, construct the full URL
    return `${this.apiUrl.replace('/api', '')}/storage/${book.book_image}`;
  }
}