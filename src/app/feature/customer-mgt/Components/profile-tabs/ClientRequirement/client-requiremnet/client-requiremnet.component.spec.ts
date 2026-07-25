import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRequiremnetComponent } from './client-requiremnet.component';

describe('ClientRequiremnetComponent', () => {
  let component: ClientRequiremnetComponent;
  let fixture: ComponentFixture<ClientRequiremnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientRequiremnetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientRequiremnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
