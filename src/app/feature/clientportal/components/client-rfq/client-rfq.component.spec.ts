import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRFQComponent } from './client-rfq.component';

describe('ClientRFQComponent', () => {
  let component: ClientRFQComponent;
  let fixture: ComponentFixture<ClientRFQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRFQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRFQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
