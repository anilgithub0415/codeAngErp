import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard5Component } from './dashboard5.component';

describe('Dashboard5Component', () => {
  let component: Dashboard5Component;
  let fixture: ComponentFixture<Dashboard5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
