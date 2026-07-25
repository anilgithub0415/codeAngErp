import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationKanbanCardComponent } from './quotation-kanban-card.component';

describe('QuotationKanbanCardComponent', () => {
  let component: QuotationKanbanCardComponent;
  let fixture: ComponentFixture<QuotationKanbanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationKanbanCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationKanbanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
