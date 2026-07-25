import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductdirectorylistComponent } from './productdirectorylist.component';

describe('ProductdirectorylistComponent', () => {
  let component: ProductdirectorylistComponent;
  let fixture: ComponentFixture<ProductdirectorylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductdirectorylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductdirectorylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
