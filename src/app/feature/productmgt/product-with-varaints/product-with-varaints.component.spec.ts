import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductWithVaraintsComponent } from './product-with-varaints.component';

describe('ProductWithVaraintsComponent', () => {
  let component: ProductWithVaraintsComponent;
  let fixture: ComponentFixture<ProductWithVaraintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductWithVaraintsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductWithVaraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
