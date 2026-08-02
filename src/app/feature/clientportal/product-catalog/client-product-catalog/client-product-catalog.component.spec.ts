import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProductCatalogComponent } from './client-product-catalog.component';

describe('ClientProductCatalogComponent', () => {
  let component: ClientProductCatalogComponent;
  let fixture: ComponentFixture<ClientProductCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProductCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProductCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
