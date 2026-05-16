import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatsectiontypeComponent } from './repeatsectiontype.component';

describe('RepeatsectiontypeComponent', () => {
  let component: RepeatsectiontypeComponent;
  let fixture: ComponentFixture<RepeatsectiontypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatsectiontypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepeatsectiontypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
