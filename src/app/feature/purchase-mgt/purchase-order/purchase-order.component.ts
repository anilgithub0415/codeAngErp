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
import { PurchaseService } from '../../../core/services/purchase.service';
import { VendorService } from '../../../core/services/vendor.service';

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
  model: any = { 
    poNumber: '', 
    vendorId: null,
    vendor: null,
    orderDate: new Date().toISOString().substring(0,10),
    deliveryDate: null,
    status: 'DRAFT',
    totalAmount: 0,
    notes: '',
    lines: [] 
  };

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
        vendorSelected: (vendor: any) => this.onVendorSelected(vendor)
      }
    },

     {
      key: 'orderDate',
      type:'datepicker',
      defaultValue: new Date().toISOString().substring(0,10),
      props: { label: 'Order Date', required: true , 
        dateFormat:'dd-mm-yy'
      }
    },
    {
      key: 'deliveryDate',
      type:'datepicker',
      props: { label: 'Delivery Date', required: false , 
        dateFormat:'dd-mm-yy'
      }
    },
    {
      key: 'status',
      type: 'input',
      props: { label: 'Status', required: true, defaultValue: 'DRAFT' }
    },
    {
      key: 'notes',
      type: 'textarea',
      props: { label: 'Notes', required: false }
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

  constructor(
    private productService: ProductService, 
    private purchaseService:PurchaseService,
    private vendorService: VendorService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Recompute totals when form value changes
    this.form.valueChanges?.subscribe(() => this.computeTotals());
  }

  onVendorSelected(vendor: any) {
    if (vendor) {
      this.model.vendorId = vendor.id;
      this.model.vendor = vendor;
      this.form.patchValue({ vendorId: vendor.id });
      this.messageService.add({ severity: 'success', summary: 'Vendor Selected', detail: `Vendor ${vendor.vendorName} selected` });
    }
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
    console.log('model of purchase:',this.model);
    
    if ( !this.model.vendorId || !this.model.lines?.length) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Purchase order number, vendor, and at least one product are required' });
      return;
    }

    // Format the data to match the backend entity structure
    const purchaseOrderData = {
      poNumber: this.model.poNumber,
      tenantId: 1, // You might want to get this from a service or config
      vendorId: this.model.vendorId,
      orderDate: this.model.orderDate,
      deliveryDate: this.model.deliveryDate,
      status: this.model.status || 'DRAFT',
      totalAmount: this.totals.grandTotal,
      notes: this.model.notes || '',
      items: this.model.lines.map((line:any) => ({
        productId: line.productId,
        quantity: line.qty,
        finalPrice: line.finalPrice
      }))
    };

   this.purchaseService.createPurchaseOrder(purchaseOrderData).subscribe(res=>console.log('Product saved successfully!',res)   )

    // TODO: Implement API call to save order
    console.log('Saving purchase order:', purchaseOrderData);
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Purchase order saved successfully' }); 
  }

  clearPurchase() {
    this.model = { 
      poNumber: '', 
      vendorId: null,
      vendor: null,
      orderDate: new Date().toISOString().substring(0,10),
      deliveryDate: null,
      status: 'DRAFT',
      totalAmount: 0,
      notes: '',
      lines: [] 
    };
    this.totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };
    this.form.reset();
  }
  async getProductFinalPrice(prodId: number, p: Product): Promise<any> {
    return new Promise((resolve) => {
      this.productService.getProductFinalPrice(prodId, 1, p).subscribe(afinalPrice => {
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

