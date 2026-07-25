import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantTypesComponent } from './tenant-types.component';

describe('TenantTypesComponent', () => {
  let component: TenantTypesComponent;
  let fixture: ComponentFixture<TenantTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
