import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMgtComponent } from './user-mgt.component';

describe('UserMgtComponent', () => {
  let component: UserMgtComponent;
  let fixture: ComponentFixture<UserMgtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMgtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMgtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
