import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDirectorylistComponent } from './sales-directorylist.component';

describe('SalesDirectorylistComponent', () => {
  let component: SalesDirectorylistComponent;
  let fixture: ComponentFixture<SalesDirectorylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesDirectorylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesDirectorylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
