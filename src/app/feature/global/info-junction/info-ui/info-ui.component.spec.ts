import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoUIComponent } from './info-ui.component';

describe('InfoUIComponent', () => {
  let component: InfoUIComponent;
  let fixture: ComponentFixture<InfoUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoUIComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
