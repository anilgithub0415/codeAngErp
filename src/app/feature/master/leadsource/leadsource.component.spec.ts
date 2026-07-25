import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsourceComponent } from './leadsource.component';

describe('LeadsourceComponent', () => {
  let component: LeadsourceComponent;
  let fixture: ComponentFixture<LeadsourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadsourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
