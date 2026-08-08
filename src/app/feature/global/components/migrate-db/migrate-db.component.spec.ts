import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrateDBComponent } from './migrate-db.component';

describe('MigrateDBComponent', () => {
  let component: MigrateDBComponent;
  let fixture: ComponentFixture<MigrateDBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MigrateDBComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MigrateDBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
