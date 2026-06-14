import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductmultiselectComponent } from './productmultiselect.component';

describe('ProductmultiselectComponent', () => {
  let component: ProductmultiselectComponent;
  let fixture: ComponentFixture<ProductmultiselectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductmultiselectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductmultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
