import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationKanbanBoardComponent } from './quotation-kanban-board.component';

describe('QuotationKanbanBoardComponent', () => {
  let component: QuotationKanbanBoardComponent;
  let fixture: ComponentFixture<QuotationKanbanBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationKanbanBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationKanbanBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
