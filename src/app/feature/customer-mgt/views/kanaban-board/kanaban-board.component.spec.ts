import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanabanBoardComponent } from './kanaban-board.component';

describe('KanabanBoardComponent', () => {
  let component: KanabanBoardComponent;
  let fixture: ComponentFixture<KanabanBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanabanBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KanabanBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
