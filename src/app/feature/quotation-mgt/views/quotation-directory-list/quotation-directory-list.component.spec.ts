import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationDirectoryListComponent } from './quotation-directory-list.component';

describe('QuotationDirectoryListComponent', () => {
  let component: QuotationDirectoryListComponent;
  let fixture: ComponentFixture<QuotationDirectoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationDirectoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationDirectoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
