import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPOGridComponent } from './client-po-grid.component';

describe('ClientPOGridComponent', () => {
  let component: ClientPOGridComponent;
  let fixture: ComponentFixture<ClientPOGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPOGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPOGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
