import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDashboardComponentComponent } from './client-dashboard.component.component';

describe('ClientDashboardComponentComponent', () => {
  let component: ClientDashboardComponentComponent;
  let fixture: ComponentFixture<ClientDashboardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDashboardComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientDashboardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
