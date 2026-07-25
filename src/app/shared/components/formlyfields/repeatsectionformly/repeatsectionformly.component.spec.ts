import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatsectionformlyComponent } from './repeatsectionformly.component';

describe('RepeatsectionformlyComponent', () => {
  let component: RepeatsectionformlyComponent;
  let fixture: ComponentFixture<RepeatsectionformlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatsectionformlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepeatsectionformlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
