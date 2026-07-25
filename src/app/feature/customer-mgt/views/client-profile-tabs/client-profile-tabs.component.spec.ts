import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProfileTabsComponent } from './client-profile-tabs.component';

describe('ClientProfileTabsComponent', () => {
  let component: ClientProfileTabsComponent;
  let fixture: ComponentFixture<ClientProfileTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProfileTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProfileTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
