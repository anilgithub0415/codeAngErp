import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseDirectorylistComponent } from './purchase-directorylist.component';

describe('PurchaseDirectorylistComponent', () => {
  let component: PurchaseDirectorylistComponent;
  let fixture: ComponentFixture<PurchaseDirectorylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseDirectorylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseDirectorylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
