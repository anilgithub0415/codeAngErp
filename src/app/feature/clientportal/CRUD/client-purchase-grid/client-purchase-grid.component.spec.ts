import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPurchaseGridComponent } from './client-purchase-grid.component';

describe('ClientPurchaseGridComponent', () => {
  let component: ClientPurchaseGridComponent;
  let fixture: ComponentFixture<ClientPurchaseGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPurchaseGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPurchaseGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
