import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPromotionsComponent } from './client-promotions.component';

describe('ClientPromotionsComponent', () => {
  let component: ClientPromotionsComponent;
  let fixture: ComponentFixture<ClientPromotionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPromotionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
