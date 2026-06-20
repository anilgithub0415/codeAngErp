import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDDLComponent } from './test-ddl.component';

describe('TestDDLComponent', () => {
  let component: TestDDLComponent;
  let fixture: ComponentFixture<TestDDLComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDDLComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestDDLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
