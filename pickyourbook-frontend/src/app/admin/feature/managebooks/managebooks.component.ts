import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface Book {
  id: number;
  book_isbn: number;
  book_name: string;
  book_author: string;
  book_publication: string;
  book_price: number;
  book_condition: string;
  book_quantity: number;
  book_pic: string;
  category_id: number;
  subcategory_id: number;
  subsubcategory_id: number;
  owner_email: string; 
}

@Component({
  selector: 'app-managebooks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './managebooks.component.html',
  styleUrl: './managebooks.component.scss'
})

export class ManagebooksComponent implements OnInit {
  books: Book[] = [];
  loading = true;
  searchTerm = '';
  currentPage = 1;

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    fetch('books.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch Books');
        }
        return response.json();
      })
      .then((data) => {
        if (data.books && Array.isArray(data.books)) {
          this.books = data.books.map((book: any) => {
            return {
              id: book.id,
              book_isbn: book.book_isbn,
              book_name: book.book_name,
              book_author: book.book_author,
              book_publication: book.book_publication,
              book_price: book.book_price,
              book_condition: book.book_condition,
              book_quantity: book.book_quantity,
              book_pic: book.book_pic || '',
              category_id: book.category_id,
              subcategory_id: book.subcategory_id,
              subsubcategory_id: book.subsubcategory_id,
              owner_email: book.owner_email
            };
          });
        } else {
          console.error('Expected books array in data, got:', data);
          this.books = [];
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading books:', error);
        this.loading = false;
      });
  }
}
