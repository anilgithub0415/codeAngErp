import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextSelectionDialogComponent } from './context-selection-dialog.component';

describe('ContextSelectionDialogComponent', () => {
  let component: ContextSelectionDialogComponent;
  let fixture: ComponentFixture<ContextSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextSelectionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
