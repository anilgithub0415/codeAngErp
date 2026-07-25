import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMasterFormComponent } from './product-master-form.component';

describe('ProductMasterFormComponent', () => {
  let component: ProductMasterFormComponent;
  let fixture: ComponentFixture<ProductMasterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductMasterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductMasterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
