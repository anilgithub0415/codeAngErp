import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPOMgrComponent } from './client-po-mgr.component';

describe('ClientPOMgrComponent', () => {
  let component: ClientPOMgrComponent;
  let fixture: ComponentFixture<ClientPOMgrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPOMgrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPOMgrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
