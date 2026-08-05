import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRFQComponent } from './info-rfq.component';

describe('InfoRFQComponent', () => {
  let component: InfoRFQComponent;
  let fixture: ComponentFixture<InfoRFQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoRFQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoRFQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
