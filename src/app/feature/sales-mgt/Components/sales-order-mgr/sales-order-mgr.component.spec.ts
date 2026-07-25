import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderMgrComponent } from './sales-order-mgr.component';

describe('SalesOrderMgrComponent', () => {
  let component: SalesOrderMgrComponent;
  let fixture: ComponentFixture<SalesOrderMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOrderMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOrderMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
