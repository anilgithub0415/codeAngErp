import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitepurchaseComponent } from './sitepurchase.component';

describe('SitepurchaseComponent', () => {
  let component: SitepurchaseComponent;
  let fixture: ComponentFixture<SitepurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SitepurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SitepurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
