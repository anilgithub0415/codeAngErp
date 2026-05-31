import { Component, OnInit } from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';


@Component({
  selector: 'app-salesorder',
  imports: [ReactiveFormsModule, FormsModule,FormlyModule,CommonModule],
  templateUrl: './salesorder.component.html',
  styleUrl: './salesorder.component.scss'
})
export class SalesorderComponent {
  form = new FormGroup({});
  model: any = { orderNumber: '', selectedProducts: [], lines: [] };

  totals = { subTotal: 0, taxTotal: 0, grandTotal: 0 };

  fields: FormlyFieldConfig[] = [
    {
      key: 'orderNumber',
      type: 'input',
      props: { label: 'Order Number', required: true }
    },
    {
      key: 'selectedProducts',
      type: 'product-multiselect', defaultValue:[],
      props: { label: 'Select products to add' }
    },
    {
      key: 'lines',
      type: 'repeat',
      props: { label: 'Order Lines' },
      fieldArray: {
        fieldGroup: [
          { key: 'productId', type: 'input', props: { hide: true } },
          { key: 'productName', type: 'input', props: { label: 'Product', readonly: true } },
          { key: 'sku', type: 'input', props: { label: 'SKU', readonly: true } },
          { key: 'basePrice', type: 'input', props: { label: 'Unit Price', type: 'number' } },
          { key: 'finalPrice', type: 'input', props: { label: 'Final Price', type: 'number' } },
          { key: 'qty', type: 'input', props: { label: 'Qty', type: 'number', min: 1 } },
          { key: 'lineTotal', type: 'input', props: { label: 'Line Total', readonly: true } }
        ]
      }
    }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Recompute totals when form value changes
    this.form.valueChanges?.subscribe(() => this.computeTotals());
  }
addSelectedProducts() {  
  const controlVal = this.form.get('selectedProducts')?.value; 
  
  const selected = Array.isArray(controlVal) ? controlVal : (Array.isArray(this.model.selectedProducts) ? this.model.selectedProducts : []);
  if (!selected || selected.length === 0) {    return;}

  const processItems = async (items: any[]) => { 
  
    if (!this.model.lines) this.model.lines = [];
    for (const p of items) {
      const productId = p?.id ?? p?.value ?? p?.sku ?? p?.code ?? p?.prodName ?? p?.name ?? String(p);
      if (this.model.lines.find((l: any) => l.productId === productId)) continue;
      const productName = p?.prodName ?? p?.name ?? p?.label ?? String(p);
      const basePrice = p?.basePrice ?? p?.price ?? 0;
      const finalPrice= await this.getProductFinalPrice(productId,p);   
      this.model.lines.push({
        productId,
        productName,
        sku: p?.sku ?? p?.code ?? '',
        basePrice,finalPrice,
        qty: 1,
        lineTotal: basePrice
      }); 
      
    }
    this.model.selectedProducts = [];
    this.form.patchValue({ lines: this.model.lines, selectedProducts: [] });
    this.computeTotals();
  };

  const needsResolve = selected.some((s: any) => s == null || typeof s !== 'object');

  if (needsResolve) { 
  
    this.productService.getProducts('1').subscribe({
      next: (list: any[]) => {
        const resolved = selected.map((item: any) => {
          if (item && typeof item === 'object') return item;
          const found = list.find(p => p.id == item || p.sku == item || p.code == item || p.prodName == item || p.name == item);
        
          
          return found ?? { id: item, prodName: String(item), name: String(item), label: String(item), value: item };
        });
        processItems(resolved);
      },
      error: () => {
        const fallback = selected.map((s: any) => (typeof s === 'object' ? s : { id: s, prodName: String(s), name: String(s), label: String(s), value: s }));
        processItems(fallback);
      }
    });
  } else {
    processItems(selected as any[]);
  }
}

  addOneSelected() {
    const controlVal = this.form.get('selectedProducts')?.value;
    const selected = Array.isArray(controlVal) ? controlVal : (Array.isArray(this.model.selectedProducts) ? this.model.selectedProducts : []);
    if (!selected || selected.length === 0) return;

    const item = selected[0];
    const pushLine = (p: any) => {
      if (!this.model.lines) this.model.lines = [];
      const productId = p?.id ?? p?.value ?? p?.sku ?? p?.code ?? p?.prodName ?? p?.name ?? String(p);
      if (this.model.lines.find((l: any) => l.productId === productId)) return;
      const basePrice = p?.basePrice ?? p?.price ?? 0;
      const line = {
        productId,
        productName: p?.prodName ?? p?.name ?? p?.label ?? String(p),
        sku: p?.sku ?? p?.code ?? '',
        basePrice,
        qty: 1,
        lineTotal: basePrice
      };
      this.model.lines.push(line);
      // remove consumed selection
      selected.shift();
      this.model.selectedProducts = selected;
      this.form.patchValue({ lines: this.model.lines, selectedProducts: selected });
      this.computeTotals();
    };

    if (item && typeof item === 'object') {
      pushLine(item);
      return;
    }

    // resolve primitive selection to product object
    this.productService.getProducts('1').subscribe({
      next: (list: any[]) => {
        const found = list.find(p => p.id == item || p.sku == item || p.code == item || p.prodName == item || p.name == item);
        pushLine(found ?? { id: item, prodName: String(item), name: String(item), label: String(item), value: item });
      },
      error: () => {
        pushLine({ id: item, prodName: String(item), name: String(item), label: String(item), value: item });
      }
    });
  }
  async getProductFinalPrice(prodId:number,p:Product):Promise<any>{
    return new Promise((resolve,reject)=>{
      this.productService.getProductFinalPrice(prodId,'1',p).subscribe(afinalPrice=>{
        
   
    
    resolve(afinalPrice);
    })
    })


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
