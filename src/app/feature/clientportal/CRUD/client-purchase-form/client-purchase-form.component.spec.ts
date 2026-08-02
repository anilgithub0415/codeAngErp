import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPurchaseFormComponent } from './client-purchase-form.component';

describe('ClientPurchaseFormComponent', () => {
  let component: ClientPurchaseFormComponent;
  let fixture: ComponentFixture<ClientPurchaseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPurchaseFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPurchaseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
