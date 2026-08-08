import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoJunctionComponent } from './info-junction.component';

describe('InfoJunctionComponent', () => {
  let component: InfoJunctionComponent;
  let fixture: ComponentFixture<InfoJunctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoJunctionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoJunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
