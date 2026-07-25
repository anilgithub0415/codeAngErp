import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantKanbanCardComponent } from './tenant-kanban-card.component';

describe('TenantKanbanCardComponent', () => {
  let component: TenantKanbanCardComponent;
  let fixture: ComponentFixture<TenantKanbanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantKanbanCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantKanbanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
