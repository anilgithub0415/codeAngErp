import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRFQMgrComponent } from './client-rfq-mgr.component';

describe('ClientRFQMgrComponent', () => {
  let component: ClientRFQMgrComponent;
  let fixture: ComponentFixture<ClientRFQMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRFQMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRFQMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
