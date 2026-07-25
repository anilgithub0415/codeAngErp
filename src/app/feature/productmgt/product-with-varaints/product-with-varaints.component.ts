import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { ProductService } from '../../../core/services/product.service';
import { ConfigService } from '../../../config.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateProductDto } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';

@Component({
  selector: 'app-product-with-varaints',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ReactiveFormsModule, FormsModule, FormlyModule, CommonModule, 
    TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ],
   providers: [MessageService],
  templateUrl: './product-with-varaints.component.html',
  styleUrl: './product-with-varaints.component.scss'
})
export class ProductWithVaraintsComponent {
 tenantId!: number;
  form = new FormGroup({});
  model: any = {}; // Holds template configurations
  fields: FormlyFieldConfig[] = [];

  variantsList: any[] = [];

   newVariant: any = {
    sku: '',
    size: '',
    finish: '',
    basePrice: 0,
    currentstock: 0,
    customAttributes: { tier_prices: { Wholesaler_price: 0, B2B_price: 0, B2C_price: 0 } }
  };

  editingVariantIndex: number | null = null;

  private productService = inject(ProductService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private formlyConfig = inject(FormlyConfig);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.getProductFormFields();
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
  }

  getProductFormFields() {
    this.productService.getProducttableFieldsConfig(this.tenantId).subscribe((dbFields: any[]) => {
      const groups: FormlyFieldConfig[] = [];
      let currentGroup: FormlyFieldConfig | null = null;

      dbFields.forEach((dbField) => {
        if (dbField.GroupClassName) {
          if (currentGroup) groups.push(currentGroup);
          currentGroup = { fieldGroupClassName: dbField.GroupClassName, fieldGroup: [] };
        }

        const field: FormlyFieldConfig = {
          key: dbField.FieldName,
          type: dbField.FieldType,
          className: dbField.className,
          props: {
            label: dbField.FieldLabel,
            required: dbField.IsRequired
          }
        };

        if (currentGroup) {
          currentGroup.fieldGroup!.push(field);
        } else {
          groups.push(field);
        }
      });

      if (currentGroup) groups.push(currentGroup);
      this.fields = groups;
    });
  }

  addVariantToGrid() {
    if (!this.newVariant.sku) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Data', detail: 'Variant SKU is required' });
      return;
    }
const assignedVariant = {
      ...this.newVariant,
      customAttributes: {
        tier_prices: {
          Wholesaler_price: this.newVariant.basePrice * 0.85, // Example 15% markdown default tier assignment rules logic
          B2B_price: this.newVariant.basePrice * 0.90,
          B2C_price: this.newVariant.basePrice
        }
      }
    };

    
    if (this.editingVariantIndex !== null) {
      this.variantsList[this.editingVariantIndex] = assignedVariant;
      this.editingVariantIndex = null;
    } else {
      this.variantsList.push(assignedVariant);
    }

    this.resetVariantInputs();
  }

  onEditVariant(variant: any, index: number) {
    this.editingVariantIndex = index;
    this.newVariant = { ...variant };
  }

  removeVariant(index: number) {
    this.variantsList.splice(index, 1);
  }

  resetVariantInputs() {
    this.newVariant = {
      sku: '', size: '', finish: '', basePrice: 0, currentstock: 0,
      customAttributes: { tier_prices: { Wholesaler_price: 0, B2B_price: 0, B2C_price: 0 } }
    };
  }

   clearProduct() {
    this.form.reset();
    this.variantsList = [];
    this.resetVariantInputs();
    this.editingVariantIndex = null;
  }
  saveProduct() {
    if (!this.form.valid || this.variantsList.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Template definitions and variants required.' });
      return;
    }
     const nestedVariantPayloadTemplate = {
      tenantId: this.tenantId,
      prodName: this.model.prodName, // Shared Master Name (e.g. Brass Ball Valve)
      description: this.model.description,

      variants: this.variantsList
    };

      this.productService.createProduct(nestedVariantPayloadTemplate).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Product Template along with variants mapped correctly.' });
        this.clearProduct();
      },
      error: (err) => console.error(err)
    });
  }
}

/* helpful code from AI , related with sku containing -BASE at end that is series and if real sku take real product*/
/*// Example Express.js router logic handler
app.get('/api/inventory/search/:sku', async (req, res) => {
    const searchSku = req.params.sku;

    // Check if the search is for a family series code
    if (searchSku.endsWith('-BASE')) {
        // Fetch the parent template and include all variants for a grid display
        const productFamily = await productTemplateRepository.findOne({
            where: { sku: searchSku },
            relations: ['variants']
        });
        return res.json({ type: 'FAMILY', data: productFamily });
    } else {
        // Fetch the specific physical item for immediate sales or picking
        const individualVariant = await productVariantRepository.findOne({
            where: { sku: searchSku },
            relations: ['productTemplate']
        });
        return res.json({ type: 'PHYSICAL_ITEM', data: individualVariant });
    }
});
 */