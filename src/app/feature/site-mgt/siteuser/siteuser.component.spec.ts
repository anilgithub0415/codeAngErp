import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteuserComponent } from './siteuser.component';

describe('SiteuserComponent', () => {
  let component: SiteuserComponent;
  let fixture: ComponentFixture<SiteuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteuserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
