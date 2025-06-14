import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagecategoriesComponent } from './managecategories.component';

describe('ManagecategoriesComponent', () => {
  let component: ManagecategoriesComponent;
  let fixture: ComponentFixture<ManagecategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagecategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagecategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
