import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatsectionComponent } from './repeatsection.component';

describe('RepeatsectionComponent', () => {
  let component: RepeatsectionComponent;
  let fixture: ComponentFixture<RepeatsectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatsectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepeatsectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
