import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPortalLayoutComponent } from './client-portal-layout.component';

describe('ClientPortalLayoutComponent', () => {
  let component: ClientPortalLayoutComponent;
  let fixture: ComponentFixture<ClientPortalLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPortalLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPortalLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
