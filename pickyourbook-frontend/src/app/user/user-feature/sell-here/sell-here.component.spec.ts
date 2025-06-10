import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellHereComponent } from './sell-here.component';

describe('SellHereComponent', () => {
  let component: SellHereComponent;
  let fixture: ComponentFixture<SellHereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellHereComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellHereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
