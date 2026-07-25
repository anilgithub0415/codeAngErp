import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesKanbanCardComponent } from './sales-kanban-card.component';

describe('SalesKanbanCardComponent', () => {
  let component: SalesKanbanCardComponent;
  let fixture: ComponentFixture<SalesKanbanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesKanbanCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesKanbanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
