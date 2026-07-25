import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMgrComponent } from './user-mgr.component';

describe('UserMgrComponent', () => {
  let component: UserMgrComponent;
  let fixture: ComponentFixture<UserMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
