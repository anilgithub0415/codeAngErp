import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPurchaseComponent } from './client-purchase.component';

describe('ClientPurchaseComponent', () => {
  let component: ClientPurchaseComponent;
  let fixture: ComponentFixture<ClientPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
