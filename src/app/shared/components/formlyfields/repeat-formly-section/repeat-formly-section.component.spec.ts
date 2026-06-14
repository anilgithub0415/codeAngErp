import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatFormlySectionComponent } from './repeat-formly-section.component';

describe('RepeatFormlySectionComponent', () => {
  let component: RepeatFormlySectionComponent;
  let fixture: ComponentFixture<RepeatFormlySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatFormlySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepeatFormlySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
