import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-purchase-order',
  imports: [ReactiveFormsModule, FormsModule, FormlyModule, CommonModule, 
    TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ,DatePickerModule
  ],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.scss',
   providers: [MessageService]
})
export class PurchaseOrderComponent implements OnInit {
  form = new FormGroup({});
  model: any = { orderNumber: '', selectedProducts: [], lines: [] };

  totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };

  fields: FormlyFieldConfig[] = [
    {
      key: 'poNumber',
      type: 'input',
      props: { label: 'Purchase Order Number', required: true }
    },
    
     {
      key: 'vendorId',
     type: 'vendor-search',
      props: {
        label: 'Search Vendor',
        placeholder: 'Type to search vendor...',
        productAdded: (product: any) => this.onProductAdded(product)
      }
    },

     {
      key: 'orderDate',
      //type: 'input',
      type:'datepicker',
      defaultValue: new Date().toISOString().substring(0,10),
      props: { label: 'orderDate', required: true , 
        dateFormat:'dd-mm-yy'
      }
    },
    {
      key: 'productSearch',
      type: 'product-search',
      props: {
        label: 'Search Product',
        placeholder: 'Type to search products...',
        productAdded: (product: any) => this.onProductAdded(product)
      }
    }
  ];

  constructor(private productService: ProductService, private messageService: MessageService) {}

  ngOnInit(): void {
    // Recompute totals when form value changes
    this.form.valueChanges?.subscribe(() => this.computeTotals());
  }
onProductAdded(product: any) {
    this.addProductToOrder(product);
  }

  async addProductToOrder(product: any) {
    if (!product) return;

    const productId = product?.id ?? product?.value ?? product?.sku ?? product?.code ?? product?.prodName ?? product?.name ?? String(product);
    if (this.model.lines?.find((l: any) => l.productId === productId)) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'Product already added to order' });
      return;
    }

    if (!this.model.lines) this.model.lines = [];

    const basePrice = product?.basePrice ?? product?.price ?? 0;
    const finalPrice = await this.getProductFinalPrice(productId, product);

    this.model.lines.push({
      productId,
      productName: product?.prodName ?? product?.name ?? product?.label ?? String(product),
      sku: product?.sku ?? product?.code ?? '',
      basePrice,
      finalPrice,
      qty: 1,
      lineTotal: basePrice
    });

    this.form.patchValue({ lines: this.model.lines });
    this.computeTotals();
    this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Product added to order' });
  }

  removeLine(index: number) {
    this.model.lines.splice(index, 1);
    this.form.patchValue({ lines: this.model.lines });
    this.computeTotals();
  }

  updateLineTotal(line: any) {
    line.lineTotal = +(line.qty * line.basePrice).toFixed(2);
    this.computeTotals();
  }

  savePurchase() {
    if (!this.model.orderNumber || !this.model.lines?.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Order number and at least one product required' });
      return;
    }
    // TODO: Implement API call to save order
    console.log('Saving order:', this.model);
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Order saved successfully' });
  }

  clearPurchase() {
    this.model = { orderNumber: '', selectedProducts: [], lines: [] };
    this.totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
    this.form.reset();
  }
  async getProductFinalPrice(prodId: number, p: Product): Promise<any> {
    return new Promise((resolve) => {
      this.productService.getProductFinalPrice(prodId, '1', p).subscribe(afinalPrice => {
        resolve(afinalPrice);
      });
    });
  }

  computeTotals() {
    const lines = this.model.lines || [];
    let sub = 0;
    for (const l of lines) {
      const qty = Number(l.qty || 0);
      const base = Number(l.basePrice || 0);
      l.lineTotal = +(qty * base).toFixed(2);
      sub += l.lineTotal;
    }
    this.totals.subTotal = +(sub).toFixed(2);
    this.totals.taxTotal = +(this.totals.subTotal * 0).toFixed(2);
    this.totals.grandTotal = +(this.totals.subTotal + this.totals.taxTotal).toFixed(2);
  }
}

