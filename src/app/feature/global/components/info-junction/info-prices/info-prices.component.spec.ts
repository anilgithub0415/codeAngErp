import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoPricesComponent } from './info-prices.component';

describe('InfoPricesComponent', () => {
  let component: InfoPricesComponent;
  let fixture: ComponentFixture<InfoPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoPricesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
