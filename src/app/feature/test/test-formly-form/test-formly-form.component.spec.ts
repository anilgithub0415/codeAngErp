import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFormlyFormComponent } from './test-formly-form.component';

describe('TestFormlyFormComponent', () => {
  let component: TestFormlyFormComponent;
  let fixture: ComponentFixture<TestFormlyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFormlyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestFormlyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
