import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GharanaFormJSONBackUpsComponent } from './gharana-form-jsonback-ups.component';

describe('GharanaFormJSONBackUpsComponent', () => {
  let component: GharanaFormJSONBackUpsComponent;
  let fixture: ComponentFixture<GharanaFormJSONBackUpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GharanaFormJSONBackUpsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GharanaFormJSONBackUpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
