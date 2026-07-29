import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientBillingAccountComponent } from './client-billing-account.component';

describe('ClientBillingAccountComponent', () => {
  let component: ClientBillingAccountComponent;
  let fixture: ComponentFixture<ClientBillingAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientBillingAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientBillingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
