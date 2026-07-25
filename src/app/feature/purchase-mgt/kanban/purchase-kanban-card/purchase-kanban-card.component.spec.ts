import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseKanbanCardComponent } from './purchase-kanban-card.component';

describe('PurchaseKanbanCardComponent', () => {
  let component: PurchaseKanbanCardComponent;
  let fixture: ComponentFixture<PurchaseKanbanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseKanbanCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseKanbanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
