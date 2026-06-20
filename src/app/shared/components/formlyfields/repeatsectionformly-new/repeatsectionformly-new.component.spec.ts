import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatsectionformlyNewComponent } from './repeatsectionformly-new.component';

describe('RepeatsectionformlyNewComponent', () => {
  let component: RepeatsectionformlyNewComponent;
  let fixture: ComponentFixture<RepeatsectionformlyNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatsectionformlyNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepeatsectionformlyNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
