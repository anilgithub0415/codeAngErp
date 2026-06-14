import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms'
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
import { CreateProductVariantDto, ProductVariantDto } from '../../../core/models/productvariant.model';
import { ProductvariantService } from '../../../core/services/productvariant.service';

@Component({
  selector: 'app-productvariant',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ReactiveFormsModule, FormsModule,FormlyModule,DataViewModule,TagModule,
    CommonModule, TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ],
  templateUrl: './productvariant.component.html',
  styleUrl: './productvariant.component.scss'
})
export class ProductvariantComponent implements OnInit, OnChanges {
  @Input() productId?: number | null;

  form = new FormGroup({
    variantName: new FormControl('', [Validators.required]),
    sku: new FormControl(''),
    basePrice: new FormControl(0, [Validators.required]),
    conversionFactor: new FormControl(1, [Validators.required]),
    initialStockUnits: new FormControl(0)
  });

  variants: ProductVariantDto[] = [];
  loading = false;

  private variantService = inject(ProductvariantService);

  ngOnInit(): void {
    if (this.productId) {
      this.loadVariants();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.loadVariants();
    }
  }

  loadVariants(): void {
    if (!this.productId) { this.variants = []; return; }
    this.loading = true;
    this.variantService.getVariants(this.productId).subscribe({
      next: v => { this.variants = v || []; this.loading = false; },
      error: err => { console.error(err); this.loading = false; alert('Failed to load variants'); }
    });
  }

  addVariant(): void {
    if (!this.productId) { alert('No product selected'); return; }
    if (this.form.invalid) { alert('Please fill required fields'); return; }

    const m = this.form.value;
    const createDto: Partial<CreateProductVariantDto> = {
      productId: this.productId,
      sku: m.sku || null,
      variantName: m.variantName!,
      basePrice: Number(m.basePrice),
      conversionFactor: Number(m.conversionFactor),
      currentStockBaseUnits: (Number(m.initialStockUnits || 0) * Number(m.conversionFactor || 1))
    };

    this.variantService.createVariant(createDto).subscribe({
      next: () => {
        alert('Variant created');
        this.loadVariants();
        this.form.reset({ conversionFactor: 1, basePrice: 0, initialStockUnits: 0 });
      },
      error: err => { console.error(err); alert('Failed to create variant'); }
    });
  }

  deleteVariant(id?: number): void {
    if (!id) return;
    if (!confirm('Delete variant?')) return;
    this.variantService.deleteVariant(id).subscribe({
      next: () => { this.variants = this.variants.filter(v => v.id !== id); },
      error: err => { console.error(err); alert('Delete failed'); }
    });
  }

  formatStock(v: ProductVariantDto): string {
    const b = Number(v?.currentStockBaseUnits ?? 0);
    const cf = Number(v?.conversionFactor ?? 1);
    if (!cf || cf <= 0) return `${b} base units`;
    const units = Math.floor(b / cf);
    const remainder = +(b - units * cf).toFixed(2);
    return remainder ? `${units} units + ${remainder} g` : `${units} units`;
  }
}
