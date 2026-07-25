import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractionLogComponent } from './interaction-log.component';

describe('InteractionLogComponent', () => {
  let component: InteractionLogComponent;
  let fixture: ComponentFixture<InteractionLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractionLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractionLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
