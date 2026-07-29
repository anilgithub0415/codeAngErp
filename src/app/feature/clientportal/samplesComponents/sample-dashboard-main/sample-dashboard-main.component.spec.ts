import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleDashboardMainComponent } from './sample-dashboard-main.component';

describe('SampleDashboardMainComponent', () => {
  let component: SampleDashboardMainComponent;
  let fixture: ComponentFixture<SampleDashboardMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleDashboardMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleDashboardMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
