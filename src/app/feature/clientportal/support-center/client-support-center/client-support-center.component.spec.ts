import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSupportCenterComponent } from './client-support-center.component';

describe('ClientSupportCenterComponent', () => {
  let component: ClientSupportCenterComponent;
  let fixture: ComponentFixture<ClientSupportCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSupportCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientSupportCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
