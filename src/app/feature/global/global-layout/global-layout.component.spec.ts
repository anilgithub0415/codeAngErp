import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalLayoutComponent } from './global-layout.component';

describe('GlobalLayoutComponent', () => {
  let component: GlobalLayoutComponent;
  let fixture: ComponentFixture<GlobalLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
