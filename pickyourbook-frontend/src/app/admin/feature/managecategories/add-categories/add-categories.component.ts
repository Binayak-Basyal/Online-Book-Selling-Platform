import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Category, SubCategory, SubSubCategory, CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-add-categories',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-categories.component.html',
  styleUrl: './add-categories.component.scss'
})
export class AddCategoriesComponent  implements OnInit {

  categoryForm: FormGroup;
  subCategoryForm: FormGroup;
  subSubCategoryForm: FormGroup;
  isSubmitting: boolean = false;
  isEditing: boolean = false;
  editingCategoryId: number | null = null;
  editingSubCategoryId: number | null = null;
  editingSubSubCategoryId: number | null = null;

  categories: Category[] = [];
  subcategories: SubCategory[] = [];
  subsubcategories: SubSubCategory[] = [];
  filteredSubcategories: SubCategory[] = [];
  filteredSubSubcategories: SubSubCategory[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      category_name: ['', [Validators.required]]
    });

    this.subCategoryForm = this.fb.group({
      category_id: ['', Validators.required],
      subcategory_name: ['', [Validators.required]]
    });

    this.subSubCategoryForm = this.fb.group({
      category_id: ['', Validators.required],
      subcategory_id: ['', Validators.required],
      subsubcategory_name: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllSubcategories();
    this.loadAllSubSubcategories();
    
    this.subCategoryForm.get('category_id')?.valueChanges.subscribe((categoryId: number) => {
      this.fetchSubCategoriesForForm(categoryId);
    });

    this.subSubCategoryForm.get('category_id')?.valueChanges.subscribe((categoryId: number) => {
      this.fetchSubCategoriesForForm(categoryId);
    });

    this.subSubCategoryForm.get('subcategory_id')?.valueChanges.subscribe((subcategoryId: number) => {
      if (subcategoryId) {
        this.categoryService.getSubsubcategoriesBySubcategory(subcategoryId).subscribe((data: any[]) => {
          this.subsubcategories = data.map((subsubcategory: { id: any; subsubcategory_name: any; subcategory_id: any; category_id: any; }) => ({
            id: Number(subsubcategory.id),
            subsubcategory_name: subsubcategory.subsubcategory_name,
            subcategory_id: Number(subsubcategory.subcategory_id),
            category_id: Number(subsubcategory.category_id)
          }));
        });
      } else {
        this.subsubcategories = [];
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getcategories().subscribe((data: any[]) => {
      this.categories = data.map((category: { id: any; category_name: any; }) => ({
        id: Number(category.id),
        category_name: category.category_name 
      }));
    });
  }

  loadAllSubcategories(): void {
    this.categoryService.getsubcategories().subscribe((data: any[]) => {
      this.subcategories = data.map((subcategory: { id: any; subcategory_name: any; category_id: any; }) => ({
        id: Number(subcategory.id),
        subcategory_name: subcategory.subcategory_name,
        category_id: Number(subcategory.category_id)
      }));
      this.filteredSubcategories = [...this.subcategories];
    });
  }

  loadAllSubSubcategories(): void {
    this.categoryService.getsubsubcategories().subscribe((data: any[]) => {
      this.subsubcategories = data.map((subsubcategory: { id: any; subsubcategory_name: any; subcategory_id: any; category_id: any; }) => ({
        id: Number(subsubcategory.id),
        subsubcategory_name: subsubcategory.subsubcategory_name,
        subcategory_id: Number(subsubcategory.subcategory_id),
        category_id: Number(subsubcategory.category_id)
      }));
      this.filteredSubSubcategories = [...this.subsubcategories];
    });
  }

  loadSubCategories(): void {
    const categoryId = this.subCategoryForm.get('category_id')?.value;
    if (categoryId) {
      this.categoryService.getsubcategoriesBycategories(categoryId).subscribe((data: any[]) => {
        this.subcategories = data.map((subcategory: { id: any; subcategory_name: any; category_id: any; }) => ({
          id: Number(subcategory.id),
          subcategory_name: subcategory.subcategory_name,
          category_id: Number(subcategory.category_id)
        }));
      });
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.category_name : '';
  }

  getSubCategoryName(subcategoryId: number): string {
    const subcategory = this.subcategories.find(sc => sc.id === subcategoryId);
    return subcategory ? subcategory.subcategory_name : '';
  }

  onCategorySubmit(): void {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;
      
      if (this.isEditing && this.editingCategoryId) {
        this.categoryService.updateCategory(this.editingCategoryId, this.categoryForm.value).subscribe({
          next: () => {
            this.categoryForm.reset();
            this.isSubmitting = false;
            this.isEditing = false;
            this.editingCategoryId = null;
            this.loadCategories();
          },
          error: (err) => {
            console.error('Error updating Category: ', err);
            this.isSubmitting = false;
          }
        });
      } else {
        this.categoryService.createcategory(this.categoryForm.value).subscribe({
          next: () => {
            this.categoryForm.reset();
            this.isSubmitting = false;
            this.loadCategories();
          },
          error: (err) => {
            console.error('Error adding Category: ', err);
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  onSubCategorySubmit(): void {
    if (this.subCategoryForm.valid) {
      this.isSubmitting = true;
      
      if (this.isEditing && this.editingSubCategoryId) {
        this.categoryService.updateSubCategory(this.editingSubCategoryId, this.subCategoryForm.value).subscribe({
          next: () => {
            this.subCategoryForm.reset();
            this.isSubmitting = false;
            this.isEditing = false;
            this.editingSubCategoryId = null;
            this.loadAllSubcategories();
          },
          error: (err) => {
            console.error('Error updating Subcategory: ', err);
            this.isSubmitting = false;
          }
        });
      } else {
        this.categoryService.createsubcategory(this.subCategoryForm.value).subscribe({
          next: () => {
            this.subCategoryForm.reset();
            this.isSubmitting = false;
            this.loadAllSubcategories();
          },
          error: (err) => {
            console.error('Error adding subcategory:', err);
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  onCategoryChange(categoryId: number): void {
    this.categoryService.getsubcategoriesBycategories(categoryId).subscribe(data => {
      this.subcategories = data;
    });
  }

  onSubSubCategorySubmit(): void {
    if (this.subSubCategoryForm.valid) {
      this.isSubmitting = true;
      
      if (this.isEditing && this.editingSubSubCategoryId) {
        this.categoryService.updateSubSubCategory(this.editingSubSubCategoryId, this.subSubCategoryForm.value).subscribe({
          next: () => {
            this.subSubCategoryForm.reset();
            this.isSubmitting = false;
            this.isEditing = false;
            this.editingSubSubCategoryId = null;
            this.loadAllSubSubcategories();
          },
          error: (err) => {
            console.error('Error updating sub-subcategory:', err);
            this.isSubmitting = false;
          }
        });
      } else {
        this.categoryService.createsubsubcategory(this.subSubCategoryForm.value).subscribe({
          next: () => {
            this.subSubCategoryForm.reset();
            this.isSubmitting = false;
            this.loadAllSubSubcategories();
          },
          error: (err) => {
            console.error('Error adding sub-subcategory:', err);
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  fetchSubCategoriesForForm(categoryId: number): void {
    if (categoryId) {
      this.categoryService.getsubcategoriesBycategories(categoryId).subscribe((data: any[]) => {
        this.subcategories = data.map((subcategory: { id: any; subcategory_name: any; category_id: any; }) => ({
          id: Number(subcategory.id),
          subcategory_name: subcategory.subcategory_name, 
          category_id: Number(subcategory.category_id)
        }));
      });
    } else {
      this.subcategories = [];
    }
  }

  // Edit methods
  editCategory(category: Category): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      category_name: category.category_name
    });
  }
  
  editSubCategory(subcategory: SubCategory): void {
    this.isEditing = true;
    this.editingSubCategoryId = subcategory.id;
    this.subCategoryForm.patchValue({
      category_id: subcategory.category_id,
      subcategory_name: subcategory.subcategory_name
    });
  }
  
  editSubSubCategory(subsubcategory: SubSubCategory): void {
    this.isEditing = true;
    this.editingSubSubCategoryId = subsubcategory.id;
    
    // First set the category to trigger the subcategory loading
    this.subSubCategoryForm.patchValue({
      category_id: subsubcategory.category_id
    });
    
    // Set the remaining values after a small delay to ensure subcategories are loaded
    setTimeout(() => {
      this.subSubCategoryForm.patchValue({
        subcategory_id: subsubcategory.subcategory_id,
        subsubcategory_name: subsubcategory.subsubcategory_name
      });
    }, 500);
  }
  
  // Delete methods
  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          console.error('Error deleting category:', err);
        }
      });
    }
  }
  
  deleteSubCategory(id: number): void {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      this.categoryService.deleteSubCategory(id).subscribe({
        next: () => {
          this.loadAllSubcategories();
        },
        error: (err) => {
          console.error('Error deleting subcategory:', err);
        }
      });
    }
  }
  
  deleteSubSubCategory(id: number): void {
    if (confirm('Are you sure you want to delete this sub-subcategory?')) {
      this.categoryService.deleteSubSubCategory(id).subscribe({
        next: () => {
          this.loadAllSubSubcategories();
        },
        error: (err) => {
          console.error('Error deleting sub-subcategory:', err);
        }
      });
    }
  }
  
  cancelEdit(): void {
    this.isEditing = false;
    this.editingCategoryId = null;
    this.editingSubCategoryId = null;
    this.editingSubSubCategoryId = null;
    this.categoryForm.reset();
    this.subCategoryForm.reset();
    this.subSubCategoryForm.reset();
  }
}


