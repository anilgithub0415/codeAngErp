import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliChallanLayoutComponent } from './deli-challan-layout.component';

describe('DeliChallanLayoutComponent', () => {
  let component: DeliChallanLayoutComponent;
  let fixture: ComponentFixture<DeliChallanLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliChallanLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliChallanLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
