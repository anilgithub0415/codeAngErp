import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantProfileTabsComponent } from './tenant-profile-tabs.component';

describe('TenantProfileTabsComponent', () => {
  let component: TenantProfileTabsComponent;
  let fixture: ComponentFixture<TenantProfileTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantProfileTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantProfileTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
