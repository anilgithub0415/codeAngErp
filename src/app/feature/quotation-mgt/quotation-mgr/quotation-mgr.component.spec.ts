import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationMgrComponent } from './quotation-mgr.component';

describe('QuotationMgrComponent', () => {
  let component: QuotationMgrComponent;
  let fixture: ComponentFixture<QuotationMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
