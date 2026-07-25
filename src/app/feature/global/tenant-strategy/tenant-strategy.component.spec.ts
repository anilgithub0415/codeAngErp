import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantStrategyComponent } from './tenant-strategy.component';

describe('TenantStrategyComponent', () => {
  let component: TenantStrategyComponent;
  let fixture: ComponentFixture<TenantStrategyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantStrategyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
