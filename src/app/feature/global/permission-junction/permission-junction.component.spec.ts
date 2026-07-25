import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionJunctionComponent } from './permission-junction.component';

describe('PermissionJunctionComponent', () => {
  let component: PermissionJunctionComponent;
  let fixture: ComponentFixture<PermissionJunctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionJunctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionJunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
