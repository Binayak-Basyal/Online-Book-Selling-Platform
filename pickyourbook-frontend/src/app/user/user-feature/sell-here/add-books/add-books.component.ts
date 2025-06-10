import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Category, CategoryService, SubCategory, SubSubCategory } from 'src/app/services/category.service';
import { BookService } from 'src/app/services/book.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-books',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, HttpClientModule],
  templateUrl: './add-books.component.html',
  styleUrl: './add-books.component.scss'
})
export class AddBooksComponent implements OnInit {
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() book: any = null;
  @Output() formSubmitted = new EventEmitter<any>();

  bookForm: FormGroup;
  errorMessage = '';
  isSubmitting = false;
  imagePreviewUrl: any;

  categories: Category[] = [];
  subcategories: SubCategory[] = [];
  subsubcategories: SubSubCategory[] = [];
  selectedCategory: number | null = null;
  selectedSubCategory: number | null = null;
  selectedFile: File | null = null;
  hasSubsubcategories = false;

  isEditMode = false;
  isViewMode = false;

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.bookForm = this.fb.group({
      book_name: ['', [Validators.required, Validators.maxLength(100)]],
      book_author: ['', [Validators.required, Validators.maxLength(100)]],
      book_publication: ['', [Validators.required, Validators.maxLength(100)]],
      book_isbn: ['', [Validators.required, Validators.pattern(/^[0-9-]{10,17}$/)]],
      book_condition: ['', Validators.required],
      book_price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      book_image: ['', Validators.required],
      category_id: ['', Validators.required],
      subcategory_id: [''],
      subsubcategory_id: [''],
    });
  }
  bookConditions = [
    { label: 'New', value: 'new' },
    { label: 'Used', value: 'used' }
  ];
  ngOnInit(): void {
    if (this.mode === 'edit' && this.book) {
      this.isEditMode = true;
      this.isViewMode = false;
      this.populateFormWithBookData(this.book);
      this.bookForm.enable();
    } else if (this.mode === 'view' && this.book) {
      this.isEditMode = false;
      this.isViewMode = true;
      this.populateFormWithBookData(this.book);
      this.bookForm.disable();
    } else {
      this.isEditMode = false;
      this.isViewMode = false;
      this.bookForm.reset();
      this.bookForm.enable();
    }
    this.loadCategories();
    // this.setCurrentUserEmail();
  }

  loadCategories(): void {
    this.categoryService.getcategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadSubcategories();
      }
    });
  }

  loadSubcategories(): void {
    this.categoryService.getsubcategories().subscribe({
      next: (subcategories) => {
        this.subcategories = subcategories;
        this.loadSubsubcategories();
      }
    });
  }

  loadSubsubcategories(): void {
    this.categoryService.getsubsubcategories().subscribe({
      next: (subsubcategories) => {
        this.subsubcategories = subsubcategories;
      }
    });
  }

  onCategoryChange(event: any): void {
    const categoryId = parseInt(event.target.value, 10);
    this.selectedCategory = categoryId;
    this.bookForm.get('subcategory_id')?.setValue('');
    this.bookForm.get('subsubcategory_id')?.setValue('');
    this.selectedSubCategory = null;
    this.categoryService.getsubcategoriesBycategories(categoryId).subscribe({
      next: (subcategories) => {
        this.subcategories = subcategories;
      }
    });
  }

  onSubCategoryChange(event: any): void {
    const subcategoryId = parseInt(event.target.value, 10);
    this.selectedSubCategory = subcategoryId;
    this.bookForm.get('subsubcategory_id')?.setValue('');
    this.hasSubsubcategories = false;
    this.categoryService.getSubsubcategoriesBySubcategory(subcategoryId).subscribe({
      next: (subsubcategories) => {
        this.subsubcategories = subsubcategories;
        this.hasSubsubcategories = subsubcategories && subsubcategories.length > 0;
      }
    });
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0] as File;
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(this.selectedFile.type)) {
        this.errorMessage = 'Please select a valid image file (JPEG, PNG, GIF, WEBP)';
        this.selectedFile = null;
        return;
      }
      if (this.selectedFile.size > 2 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 2MB';
        this.selectedFile = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      try {
        reader.readAsDataURL(this.selectedFile);
      } catch {
        this.errorMessage = 'Error previewing the selected image';
      }
      this.bookForm.get('book_image')?.setValue('file_selected');
    }
  }

  getSubsubcategoriesForSubcategory(subcategoryId: number | null): SubSubCategory[] {
    if (!subcategoryId) return [];
    return this.subsubcategories.filter(
      subsubcategory => subsubcategory.subcategory_id === subcategoryId
    );
  }

  hasSubsubcategoriesForSubcategory(subcategoryId: number | null): boolean {
    if (!subcategoryId) return false;
    return this.subsubcategories.some(
      subsubcategory => subsubcategory.subcategory_id === subcategoryId
    );
  }

  onSubmit(): void {
    // Check if user is authenticated before submitting
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug log

    if (!token) {
      this.handleAuthError('No authentication token found. Please login again.');
      return;
    }

    // Add more debugging
    console.log('Token exists, checking expiration...');



    console.log('Token is valid, proceeding with form submission...'); // Debug log

    if (this.bookForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      const formData = this.prepareFormData();

      if (this.isEditMode) formData.append('_method', 'PUT');

      const bookId = this.book?.id;
      const apiCall = this.isEditMode
        ? this.bookService.updateBook(bookId, formData)
        : this.bookService.addBook(formData);

      console.log('Making API call...'); // Debug log

      apiCall.subscribe({
        next: (response) => {
          console.log('API call successful:', response); // Debug log
          this.handleSubmitSuccess(response);
        },
        error: (error) => {
          console.error('API call failed:', error); // Debug log
          this.handleSubmitError(error);
        }
      });
    } else {
      this.markFormFieldsAsTouched();
      this.errorMessage = 'Please fix the errors in the form before submitting.';
    }
  }


  private prepareFormData(): FormData {
    const formData = new FormData();
    const formValues = { ...this.bookForm.value };

    delete formValues.book_image;
    delete formValues.owner_id;
    delete formValues.owner_email;
    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key].toString());
      }
    });
    if (this.selectedFile) {
      formData.append('book_image', this.selectedFile);
    }
    return formData;
  }

  private handleSubmitSuccess(response: any): void {
    this.isSubmitting = false;
    this.formSubmitted.emit(response);
  }

  private handleSubmitError(error: any): void {
    this.isSubmitting = false;

    // Handle authentication errors
    if (error.status === 401) {
      this.handleAuthError('Your session has expired. Please login again.');
      return;
    } else if (error.status === 403) {
      this.handleAuthError('You do not have permission to perform this action.');
      return;
    }

    // Handle validation errors
    if (error.error && error.error.errors) {
      const validationErrors = error.error.errors;
      const errorMessages = [];
      for (const field in validationErrors) {
        errorMessages.push(`${field}: ${validationErrors[field]}`);
      }
      this.errorMessage = errorMessages.join(', ');
    } else {
      this.errorMessage = error.error?.message ||
        (this.isEditMode ? 'Failed to update book.' : 'Failed to add book.') +
        ' Please try again.';
    }
  }

  private handleAuthError(message: string): void {
    this.isSubmitting = false;
    this.errorMessage = message;

    // Clear any stored tokens
    localStorage.removeItem('token');
    localStorage.removeItem('userData');

    // Optionally redirect to login after a delay
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 2000);
  }

  private markFormFieldsAsTouched(): void {
    Object.keys(this.bookForm.controls).forEach((key) => {
      this.bookForm.get(key)?.markAsTouched();
    });
  }

  private populateFormWithBookData(book: any): void {
    this.bookForm.patchValue({
      book_name: book.book_name,
      book_author: book.book_author,
      book_isbn: book.book_isbn,
      book_publication: book.book_publication,
      book_condition: book.book_condition,
      book_price: book.book_price,
      category_id: book.category_id,
      subcategory_id: book.subcategory_id,
      subsubcategory_id: book.subsubcategory_id,
      owner_id: book.owner_id,
      owner_email: book.owner_email
    });
    this.selectedCategory = book.category_id;
    if (book.subcategory_id) {
      this.selectedSubCategory = book.subcategory_id;
      this.categoryService.getsubcategoriesBycategories(book.category_id).subscribe({
        next: (subcategories) => {
          this.subcategories = subcategories;
          if (book.subsubcategory_id) {
            this.categoryService.getSubsubcategoriesBySubcategory(book.subcategory_id).subscribe({
              next: (subsubcategories) => {
                this.subsubcategories = subsubcategories;
                this.hasSubsubcategories = subsubcategories && subsubcategories.length > 0;
              }
            });
          }
        }
      });
    }
    this.setImagePreviewUrl(book);
    if (this.isEditMode) {
      this.bookForm.get('book_image')?.clearValidators();
      this.bookForm.get('book_image')?.updateValueAndValidity();
          this.bookForm.get('book_condition')?.enable();
    }
  }

  private setImagePreviewUrl(book: any): void {
    let imageUrl = book.book_image;
    if (imageUrl) {
      if (!imageUrl.startsWith('http')) {
        imageUrl = `http://localhost:8000/storage/${imageUrl}`;
      }
      this.imagePreviewUrl = imageUrl;
    }
  }

}

