import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRFQFormComponent } from './client-rfq-form.component';

describe('ClientRFQFormComponent', () => {
  let component: ClientRFQFormComponent;
  let fixture: ComponentFixture<ClientRFQFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRFQFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRFQFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
