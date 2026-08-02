import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPurchaseMgrComponent } from './client-purchase-mgr.component';

describe('ClientPurchaseMgrComponent', () => {
  let component: ClientPurchaseMgrComponent;
  let fixture: ComponentFixture<ClientPurchaseMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPurchaseMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPurchaseMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
