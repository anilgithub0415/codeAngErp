import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestiontypeComponent } from './questiontype.component';

describe('QuestiontypeComponent', () => {
  let component: QuestiontypeComponent;
  let fixture: ComponentFixture<QuestiontypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestiontypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestiontypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
