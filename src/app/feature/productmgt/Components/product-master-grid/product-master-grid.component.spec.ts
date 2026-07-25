import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMasterGridComponent } from './product-master-grid.component';

describe('ProductMasterGridComponent', () => {
  let component: ProductMasterGridComponent;
  let fixture: ComponentFixture<ProductMasterGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductMasterGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductMasterGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
