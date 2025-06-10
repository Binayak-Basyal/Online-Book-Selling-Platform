import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CategoryService, Category, SubCategory, SubSubCategory } from 'src/app/services/category.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.scss']
})
export class UserSidebarComponent implements OnInit {
  categories: Category[] = [];
  subcategories: SubCategory[] = [];
  subsubcategories: SubSubCategory[] = [];
  openCategories: number[] = [];
  openSubcategories: number[] = [];
  isLoading = true;

  constructor(
    private categoryService: CategoryService, 
    private router: Router,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    // Load all categories at once
    this.isLoading = true;
    this.loadAllData();
  }

  loadAllData(): void {
    // Get all categories first
    this.categoryService.getcategories()
      .pipe(
        catchError(error => {
          console.error('Error loading categories:', error);
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((categories: any[]) => {
        this.categories = categories.map((category: { id: any; category_name: any; }) => ({
          id: Number(category.id),
          category_name: category.category_name
        }));

        if (this.categories.length > 0) {
          // Also get all subcategories for faster access
          this.categoryService.getsubcategories()
            .pipe(
              catchError(error => {
                console.error('Error loading subcategories:', error);
                return of([]);
              })
            )
            .subscribe((data: any[]) => {
              this.subcategories = data.map((subcategory: { id: any; subcategory_name: any; category_id: any; }) => ({
                id: Number(subcategory.id),
                subcategory_name: subcategory.subcategory_name,
                category_id: Number(subcategory.category_id)
              }));

              // Get all subsubcategories for faster access
              this.categoryService.getsubsubcategories()
                .pipe(
                  catchError(error => {
                    console.error('Error loading subsubcategories:', error);
                    return of([]);
                  })
                )
                .subscribe((data: any[]) => {
                  this.subsubcategories = data.map((subsubcategory: { id: any; subsubcategory_name: any; subcategory_id: any; category_id: any; }) => ({
                    id: Number(subsubcategory.id),
                    subsubcategory_name: subsubcategory.subsubcategory_name,
                    subcategory_id: Number(subsubcategory.subcategory_id),
                    category_id: Number(subsubcategory.category_id)
                  }));
                  this.isLoading = false;
                });
            });
        } else {
          this.isLoading = false;
        }
      });
  }

  toggleCategory(categoryId: number): void {
    if (this.openCategories.includes(categoryId)) {
      this.openCategories = this.openCategories.filter((id: number) => id !== categoryId);

      // When closing a category, also close any open subcategories that belong to it
      const subcatsForCategory = this.getSubcategoriesForCategory(categoryId);
      for (const subcat of subcatsForCategory) {
        if (this.openSubcategories.includes(subcat.id)) {
          this.openSubcategories = this.openSubcategories.filter((id: number) => id !== subcat.id);
        }
      }
    } else {
      this.openCategories.push(categoryId);
    }
  }

  getSubcategoriesForCategory(categoryId: number): SubCategory[] {
    return this.subcategories.filter(subcategory => subcategory.category_id === categoryId);
  }

  toggleSubcategory(subcategoryId: number): void {
    if (this.openSubcategories.includes(subcategoryId)) {
      this.openSubcategories = this.openSubcategories.filter((id: number) => id !== subcategoryId);
    } else {
      this.openSubcategories.push(subcategoryId);
    }
  }

  hasSubsubcategories(subcategoryId: number): boolean {
    return this.subsubcategories.some(subsubcategory => subsubcategory.subcategory_id === subcategoryId);
  }

  getSubsubcategoriesForSubcategory(subcategoryId: number): SubSubCategory[] {
    return this.subsubcategories.filter(subsubcategory => subsubcategory.subcategory_id === subcategoryId);
  }
  filterByCategory(categoryId: number): void {
    this.filterService.updateFilter({ categoryId });
  }

  filterBySubcategory(categoryId: number, subcategoryId: number): void {
    this.filterService.updateFilter({ categoryId, subcategoryId });
  }

  filterBySubsubcategory(categoryId: number, subcategoryId: number, subsubcategoryId: number): void {
    this.filterService.updateFilter({ categoryId, subcategoryId, subsubcategoryId });
  }

  showAllBooks(): void {
    this.filterService.clearFilters();
  }

}
