import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRFQGridComponent } from './client-rfq-grid.component';

describe('ClientRFQGridComponent', () => {
  let component: ClientRFQGridComponent;
  let fixture: ComponentFixture<ClientRFQGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRFQGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRFQGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
