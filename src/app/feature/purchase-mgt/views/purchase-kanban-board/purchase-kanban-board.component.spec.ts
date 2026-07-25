import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseKanbanBoardComponent } from './purchase-kanban-board.component';

describe('PurchaseKanbanBoardComponent', () => {
  let component: PurchaseKanbanBoardComponent;
  let fixture: ComponentFixture<PurchaseKanbanBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseKanbanBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseKanbanBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
