import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDirectoryListComponent } from './customer-directory-list.component';

describe('CustomerDirectoryListComponent', () => {
  let component: CustomerDirectoryListComponent;
  let fixture: ComponentFixture<CustomerDirectoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDirectoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDirectoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
