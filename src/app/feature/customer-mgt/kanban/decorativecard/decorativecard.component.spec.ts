import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecorativecardComponent } from './decorativecard.component';

describe('DecorativecardComponent', () => {
  let component: DecorativecardComponent;
  let fixture: ComponentFixture<DecorativecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecorativecardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecorativecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
