import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { VendorService } from '../../../../core/services/vendor.service';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vendorsearch',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, DropdownModule, ButtonModule, FormsModule],
  templateUrl: './vendorsearch.component.html',
  styleUrl: './vendorsearch.component.scss'
})
export class FormlyFieldVendorsearch extends FieldType implements OnInit {
  public productOptions: any[] = [];
  public selectedProduct: any;
  public filteredProducts: any[] = [];

  private productService = inject(VendorService);
  public binded_products: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.productService.getProducts('1').subscribe({
      next: (data: any[]) => {
        const raw: any[] = Array.isArray(data) ? data : [];
        this.productOptions = raw.map(p => ({
          ...p,
          label: p?.vendorName ?? p?.name ?? '', //?? p?.description ?? p?.sku ?? p?.code 
          value: p?.id ?? p?.name
        }));
        this.filteredProducts = [...this.productOptions];
        this.binded_products = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.binded_products = false;
        console.log('error occured');
        this.cdr.detectChanges();
      }
    });
  }

  filterProducts(event: any) {
    const query = event.query.toLowerCase();
    this.filteredProducts = this.productOptions.filter(p =>
      p.label.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query))
    );
  }

  addToOrder() {
    if (this.selectedProduct) {
      // Call the parent component's method via formly callback using index signature
      if (this.field.props?.['productAdded']) {
        (this.field.props['productAdded'] as Function)(this.selectedProduct);
      }
      this.selectedProduct = null;
    }
  }
}