import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbStatusComponent } from './db-status.component';

describe('DbStatusComponent', () => {
  let component: DbStatusComponent;
  let fixture: ComponentFixture<DbStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DbStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DbStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
