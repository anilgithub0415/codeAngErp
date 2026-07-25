import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderGridComponent } from './sales-order-grid.component';

describe('SalesOrderGridComponent', () => {
  let component: SalesOrderGridComponent;
  let fixture: ComponentFixture<SalesOrderGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOrderGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOrderGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
