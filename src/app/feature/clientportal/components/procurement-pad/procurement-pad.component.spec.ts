import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementPadComponent } from './procurement-pad.component';

describe('ProcurementPadComponent', () => {
  let component: ProcurementPadComponent;
  let fixture: ComponentFixture<ProcurementPadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementPadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcurementPadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
