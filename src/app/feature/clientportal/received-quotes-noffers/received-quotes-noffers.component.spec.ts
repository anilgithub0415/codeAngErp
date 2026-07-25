import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedQuotesNOffersComponent } from './received-quotes-noffers.component';

describe('ReceivedQuotesNOffersComponent', () => {
  let component: ReceivedQuotesNOffersComponent;
  let fixture: ComponentFixture<ReceivedQuotesNOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedQuotesNOffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedQuotesNOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
