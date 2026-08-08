import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingworkComponent } from './pendingwork.component';

describe('PendingworkComponent', () => {
  let component: PendingworkComponent;
  let fixture: ComponentFixture<PendingworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingworkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
