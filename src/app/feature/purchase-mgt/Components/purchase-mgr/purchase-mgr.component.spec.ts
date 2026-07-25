import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseMgrComponent } from './purchase-mgr.component';

describe('PurchaseMgrComponent', () => {
  let component: PurchaseMgrComponent;
  let fixture: ComponentFixture<PurchaseMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
