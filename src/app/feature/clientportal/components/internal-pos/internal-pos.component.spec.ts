import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalPOsComponent } from './internal-pos.component';

describe('InternalPOsComponent', () => {
  let component: InternalPOsComponent;
  let fixture: ComponentFixture<InternalPOsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalPOsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalPOsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
