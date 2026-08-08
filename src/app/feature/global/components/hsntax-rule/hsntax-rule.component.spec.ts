import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HSNTaxRuleComponent } from './hsntax-rule.component';

describe('HSNTaxRuleComponent', () => {
  let component: HSNTaxRuleComponent;
  let fixture: ComponentFixture<HSNTaxRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HSNTaxRuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HSNTaxRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
