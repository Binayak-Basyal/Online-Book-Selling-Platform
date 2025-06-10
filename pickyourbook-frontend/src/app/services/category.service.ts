import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Category {
  id: number;
  category_name: string;
}

export interface SubCategory {
  id: number;
  subcategory_name: string;
  category_id: number;
}

export interface SubSubCategory {
  id: number;
  subsubcategory_name: string;
  category_id: number;
  subcategory_id: number;
}
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  //Category
  createcategory(data: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, data);
  }

  getcategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }
  
  updateCategory(id: number, data: any): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // SubCategory
  createsubcategory(data: any): Observable<SubCategory> {
    return this.http.post<SubCategory>(`${this.apiUrl}/subcategories`, data);
  }

  getsubcategories(): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.apiUrl}/subcategories`);
  }

  getsubcategoriesBycategories(categoryId: number): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(`${this.apiUrl}/categories/${categoryId}/subcategories`);
  }
  
  updateSubCategory(id: number, data: any): Observable<SubCategory> {
    return this.http.put<SubCategory>(`${this.apiUrl}/subcategories/${id}`, data);
  }

  deleteSubCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subcategories/${id}`);
  }

  // SubSubCategory
  createsubsubcategory(data: any): Observable<SubSubCategory> {
    return this.http.post<SubSubCategory>(`${this.apiUrl}/subsubcategories`, data);
  }

  getsubsubcategories(): Observable<SubSubCategory[]> {
    return this.http.get<SubSubCategory[]>(`${this.apiUrl}/subsubcategories`);
  }
  
  getSubsubcategoriesBySubcategory(subcategoryId: number): Observable<SubSubCategory[]> {
    return this.http.get<SubSubCategory[]>(`${this.apiUrl}/subcategories/${subcategoryId}/subsubcategories`);
  }
  
  updateSubSubCategory(id: number, data: any): Observable<SubSubCategory> {
    return this.http.put<SubSubCategory>(`${this.apiUrl}/subsubcategories/${id}`, data);
  }

  deleteSubSubCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subsubcategories/${id}`);
  }
}