import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoMultitenantComponent } from './info-multitenant.component';

describe('InfoMultitenantComponent', () => {
  let component: InfoMultitenantComponent;
  let fixture: ComponentFixture<InfoMultitenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoMultitenantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoMultitenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
