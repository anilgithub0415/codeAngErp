import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductKanbanCardComponent } from './product-kanban-card.component';

describe('ProductKanbanCardComponent', () => {
  let component: ProductKanbanCardComponent;
  let fixture: ComponentFixture<ProductKanbanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductKanbanCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductKanbanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
