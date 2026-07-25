import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseGridComponent } from './purchase-grid.component';

describe('PurchaseGridComponent', () => {
  let component: PurchaseGridComponent;
  let fixture: ComponentFixture<PurchaseGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
