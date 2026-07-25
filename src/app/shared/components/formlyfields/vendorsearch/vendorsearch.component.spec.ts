import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorsearchComponent } from './vendorsearch.component';

describe('VendorsearchComponent', () => {
  let component: VendorsearchComponent;
  let fixture: ComponentFixture<VendorsearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorsearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
