import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FilterCriteria {
  categoryId?: number;
  subcategoryId?: number;
  subsubcategoryId?: number;
  book_name?: string;
  book_author?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filterCriteriaSource = new BehaviorSubject<FilterCriteria>({});
  currentFilterCriteria = this.filterCriteriaSource.asObservable();

    private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  constructor() {}

  updateFilter(criteria: FilterCriteria) {
    this.filterCriteriaSource.next(criteria);
  }

  clearFilters() {
    this.filterCriteriaSource.next({});
  }
    setSearchTerm(term: string) {
    this.searchTermSubject.next(term);
  }
}