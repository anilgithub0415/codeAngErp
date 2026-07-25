import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantStrategiesComponent } from './tenant-strategies.component';

describe('TenantStrategiesComponent', () => {
  let component: TenantStrategiesComponent;
  let fixture: ComponentFixture<TenantStrategiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantStrategiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantStrategiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
