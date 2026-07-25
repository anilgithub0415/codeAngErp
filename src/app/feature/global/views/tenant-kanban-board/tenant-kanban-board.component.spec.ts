import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantKanbanBoardComponent } from './tenant-kanban-board.component';

describe('TenantKanbanBoardComponent', () => {
  let component: TenantKanbanBoardComponent;
  let fixture: ComponentFixture<TenantKanbanBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantKanbanBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantKanbanBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
