//import { Component, OnInit, inject } from '@angular/core';
import {  FormControl, Validators } from '@angular/forms';
import { ProductWithService } from '../../../core/services/product-with.service';
import { CreateProductWithVariantsDto } from '../../../core/models/ProductWithVariant.model';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnInit, inject } from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms'
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core'
import { ProductService } from '../../../core/services/product.service';
import { ConfigService } from '../../../config.service';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { AuthService } from '../../../core/services/auth.service';
import { CreateProductDto } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-product-with-variant',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ReactiveFormsModule, FormsModule,FormlyModule,DataViewModule,TagModule,
    CommonModule, TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ],
  templateUrl: './product-with-variant.component.html',
  styleUrl: './product-with-variant.component.scss'
})
export class ProductWithVariantComponent implements OnInit {
  productForm = new FormGroup({
    prodName: new FormControl('', Validators.required),
    description: new FormControl(''),
    sku: new FormControl(''),
    basePrice: new FormControl(0, Validators.required)
  });

  variantForm = new FormGroup({
    variantName: new FormControl('', Validators.required),
    sku: new FormControl(''),
    basePrice: new FormControl(0, Validators.required),
    conversionFactor: new FormControl(1, Validators.required),
    initialStockUnits: new FormControl(0)
  });

  variants: any[] = [];
  saving = false;

  private svc = inject(ProductWithService);

  ngOnInit(): void {}

  addVariant() {
    if (this.variantForm.invalid) { alert('Fill variant fields'); return; }
    const v = { ...this.variantForm.value } as any;
    v.conversionFactor = Number(v.conversionFactor) || 1;
    v.basePrice = Number(v.basePrice) || 0;
    const units = Number(v.initialStockUnits || 0);
    v.currentStockBaseUnits = +(units * v.conversionFactor);
    this.variants.push(v);
    this.variantForm.reset({ conversionFactor: 1, basePrice: 0, initialStockUnits: 0 });
  }

  removeVariant(i: number) { this.variants.splice(i, 1); }

  async saveProductWithVariants() {
    if (this.productForm.invalid) { alert('Product name and base price required'); return; }
    if (!this.variants.length) { if(!confirm('Save product without variants?')) return; }

    const dto: Partial<CreateProductWithVariantsDto> = {
      tenantId: 1,
      product: {
        tenantId: '1',
        prodName: this.productForm.value.prodName!,
        description: this.productForm.value.description!,
        sku: this.productForm.value.sku!,
        basePrice: Number(this.productForm.value.basePrice)
      },
      variants: this.variants.map(v => ({
        sku: v.sku || null,
        variantName: v.variantName,
        basePrice: Number(v.basePrice),
        conversionFactor: Number(v.conversionFactor),
        currentStockBaseUnits: Number(v.currentStockBaseUnits || 0),
        customAttributes: v.customAttributes || null
      }))
    };

    this.saving = true;
    this.svc.createProductWithVariants(dto).subscribe({
      next: (res) => {
        alert('Product with variants saved');
        this.saving = false;
        this.productForm.reset({ basePrice: 0 });
        this.variants = [];
      },
      error: (err) => { console.error(err); this.saving = false; alert('Save failed'); }
    });
  }

  formatStock(v:any){
    const b = Number(v?.currentStockBaseUnits ?? 0);
    const cf = Number(v?.conversionFactor ?? 1) || 1;
    const units = Math.floor(b / cf);
    const remainder = +(b - units * cf).toFixed(2);
    return remainder ? `${units} units + ${remainder} base` : `${units} units`;
  }
}
