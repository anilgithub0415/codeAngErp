import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseLayoutComponent } from './purchase-layout.component';

describe('PurchaseLayoutComponent', () => {
  let component: PurchaseLayoutComponent;
  let fixture: ComponentFixture<PurchaseLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
