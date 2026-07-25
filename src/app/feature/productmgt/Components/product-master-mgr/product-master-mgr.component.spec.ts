import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMasterMgrComponent } from './product-master-mgr.component';

describe('ProductMasterMgrComponent', () => {
  let component: ProductMasterMgrComponent;
  let fixture: ComponentFixture<ProductMasterMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductMasterMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductMasterMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
