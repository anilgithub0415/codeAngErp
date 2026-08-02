import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Top2barComponent } from './TopbarContextSwither.component';

describe('Top2barComponent', () => {
  let component: Top2barComponent;
  let fixture: ComponentFixture<Top2barComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Top2barComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Top2barComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
