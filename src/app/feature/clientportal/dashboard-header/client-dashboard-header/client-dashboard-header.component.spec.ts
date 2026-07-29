import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDashboardHeaderComponent } from './client-dashboard-header.component';

describe('ClientDashboardHeaderComponent', () => {
  let component: ClientDashboardHeaderComponent;
  let fixture: ComponentFixture<ClientDashboardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDashboardHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
