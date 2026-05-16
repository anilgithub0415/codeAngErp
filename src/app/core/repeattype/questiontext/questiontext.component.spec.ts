import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestiontextComponent } from './questiontext.component';

describe('QuestiontextComponent', () => {
  let component: QuestiontextComponent;
  let fixture: ComponentFixture<QuestiontextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestiontextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestiontextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
