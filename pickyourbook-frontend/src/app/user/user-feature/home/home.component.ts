import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoryService, Category } from 'src/app/services/category.service';
import { BookService } from 'src/app/services/book.service';

interface HeroSlide {
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Hero carousel properties
  heroSlides: HeroSlide[] = [
    {
      imageUrl: '../../assets/hero/1.png',
      title: 'Discover Your Next Favorite Book',
      description: 'Browse through thousands of quality pre-owned books at great prices',
      buttonText: 'Explore Books'
    },
    {
      imageUrl: '../../assets/hero/2.png',
      title: 'Turn Your Old Books Into Cash',
      description: 'Sell your used books quickly and easily on our platform',
      buttonText: 'Sell Now'
    },
    {
      imageUrl: '../../assets/hero/3.png',
      title: 'Join Our Book Loving Community',
      description: 'Connect with fellow readers and book enthusiasts',
      buttonText: 'Join Now'
    }
  ];
  currentSlide = 0;
  slideInterval: any;
  autoSlideInterval = 5000; // Change slide every 5 seconds
  slide: any;

  // New properties for categories and recent books
  categories: Category[] = [];
  recentlyViewedBooks: any[] = [];
  private categoriesInterval: any;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.startAutoSlide();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // Hero carousel methods
  startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideInterval);
  }

  stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    this.resetAutoSlideTimer();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.resetAutoSlideTimer();
  }

  setCurrentSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoSlideTimer();
  }

  resetAutoSlideTimer(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  // Load categories for the grid
  loadCategories(): void {
    this.categoryService.getcategories().subscribe({
      next: (categories) => {
        this.categories = categories.slice(0, 8); // Show only first 8 categories
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

}