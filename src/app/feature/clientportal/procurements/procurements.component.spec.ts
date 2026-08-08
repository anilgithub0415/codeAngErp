import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementsComponent } from './procurements.component';

describe('ProcurementsComponent', () => {
  let component: ProcurementsComponent;
  let fixture: ComponentFixture<ProcurementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
