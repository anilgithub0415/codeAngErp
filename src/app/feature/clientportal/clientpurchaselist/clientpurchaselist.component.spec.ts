import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientpurchaselistComponent } from './clientpurchaselist.component';

describe('ClientpurchaselistComponent', () => {
  let component: ClientpurchaselistComponent;
  let fixture: ComponentFixture<ClientpurchaselistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientpurchaselistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientpurchaselistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
