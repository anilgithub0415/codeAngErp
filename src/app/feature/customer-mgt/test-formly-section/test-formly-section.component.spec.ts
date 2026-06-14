import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFormlySectionComponent } from './test-formly-section.component';

describe('TestFormlySectionComponent', () => {
  let component: TestFormlySectionComponent;
  let fixture: ComponentFixture<TestFormlySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFormlySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestFormlySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
