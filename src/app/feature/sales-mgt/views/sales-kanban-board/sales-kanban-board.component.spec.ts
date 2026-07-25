import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesKanbanBoardComponent } from './sales-kanban-board.component';

describe('SalesKanbanBoardComponent', () => {
  let component: SalesKanbanBoardComponent;
  let fixture: ComponentFixture<SalesKanbanBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesKanbanBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesKanbanBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
