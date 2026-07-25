import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonTabsComponent } from './button-tabs.component';

describe('ButtonTabsComponent', () => {
  let component: ButtonTabsComponent;
  let fixture: ComponentFixture<ButtonTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
