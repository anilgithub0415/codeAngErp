import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerMgrComponent } from './customer-mgr.component';

describe('CustomerMgrComponent', () => {
  let component: CustomerMgrComponent;
  let fixture: ComponentFixture<CustomerMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
