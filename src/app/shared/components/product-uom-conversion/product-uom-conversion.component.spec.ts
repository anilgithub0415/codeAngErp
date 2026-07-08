import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductUomConversionComponent } from './product-uom-conversion.component';

describe('ProductUomConversionComponent', () => {
  let component: ProductUomConversionComponent;
  let fixture: ComponentFixture<ProductUomConversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductUomConversionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductUomConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
