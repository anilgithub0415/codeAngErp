import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonlistComponent } from './personlist.component';

describe('PersonlistComponent', () => {
  let component: PersonlistComponent;
  let fixture: ComponentFixture<PersonlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
