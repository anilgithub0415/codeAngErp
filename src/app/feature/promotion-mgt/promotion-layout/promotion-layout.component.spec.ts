import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionLayoutComponent } from './promotion-layout.component';

describe('PromotionLayoutComponent', () => {
  let component: PromotionLayoutComponent;
  let fixture: ComponentFixture<PromotionLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
