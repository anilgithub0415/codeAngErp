import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientOrderManagementComponent } from './client-order-management.component';

describe('ClientOrderManagementComponent', () => {
  let component: ClientOrderManagementComponent;
  let fixture: ComponentFixture<ClientOrderManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientOrderManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientOrderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
