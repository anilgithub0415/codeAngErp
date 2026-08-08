import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPOFormComponent } from './client-po-form.component';

describe('ClientPOFormComponent', () => {
  let component: ClientPOFormComponent;
  let fixture: ComponentFixture<ClientPOFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPOFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPOFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
