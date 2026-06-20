import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFeatureComponent } from './my-feature.component';

describe('MyFeatureComponent', () => {
  let component: MyFeatureComponent;
  let fixture: ComponentFixture<MyFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
