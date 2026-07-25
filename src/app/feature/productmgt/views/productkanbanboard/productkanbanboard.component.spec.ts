import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductkanbanboardComponent } from './productkanbanboard.component';

describe('ProductkanbanboardComponent', () => {
  let component: ProductkanbanboardComponent;
  let fixture: ComponentFixture<ProductkanbanboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductkanbanboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductkanbanboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
