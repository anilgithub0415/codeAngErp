import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import {  MessageService } from 'primeng/api';//Message,
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProductUomService } from '../../services/product-uom.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { Product } from '../../../core/models/product.model';
import { FormlyFieldPrimengDropdownComponent } from '../formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';

 import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
interface ProductNotinuse{
  id: number;
  prodName: string;
  sku: string | null;
  baseUom: string;
  defaultPurchaseUom: string;
  defaultSalesUom: string;
}

interface ConversionRow {
  id?: number;
  productId: number;
  purchaseUom: string;
  saleUom: string;
  conversionFactor: number;
}
@Component({
  selector: 'app-product-uom-conversion',
 schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
 CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule,
    TableModule,
    ButtonModule,
    MessagesModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './product-uom-conversion.component.html',
  styleUrl: './product-uom-conversion.component.scss'
})
export class ProductUomConversionComponent implements OnInit {
  // Inject your core infrastructure services
  private authService = inject(AuthService);
  private uomService = inject(ProductUomService);
  private messageService = inject(MessageService);

  currentTenantId!: number;
  
 // Replace: form = new FormGroup({});
// With this typed initialization mapping structure:
form = new FormGroup({
  productId: new FormControl<any>(null), productVariantId: new FormControl<any>(null),
  purchaseUom: new FormControl<string>(''),
  saleUom: new FormControl<string>(''),
  conversionFactor: new FormControl<number>(1.0000)
});

  model: any = { conversionFactor: 1.0000 };
  fields: FormlyFieldConfig[] = [];

  existingConversions: ConversionRow[] = [];
  alertMessages: any[] = [];
  private lastEvaluatedVariantId: number | null = null;

   private destroy$ = new Subject<void>();
  
  // Existing properties...
  lastEvaluatedProductId: any = null; isDirty:boolean=false;
private subscribedFieldsTrack = new Set<string>();

    private formlyConfig = inject(FormlyConfig);
  ngOnInit(): void {
    this.formlyConfig.setType({
                  name: 'primeng-dropdown',
                  component: FormlyFieldPrimengDropdownComponent,
                });
    // Dynamically retrieve the multi-tenant context boundary from active user session
    //const currentUser = this.authService.getCurrentUser(); 
    this.currentTenantId = this.authService.getTenantId()!;//currentUser?.tenantId || 1;

    this.loadFormlyConfiguration();
    this.setupProductChangePipeline();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFormlyConfiguration(): void {
    const rawJsonConfig = [
      {
        fieldGroupClassName: 'grid formgrid p-fluid align-items-end row-gap-3',
        fieldGroup: [
          {
            key: 'productId',
            type: 'primeng-dropdown',
            className: 'col-12 md:col-3',
            templateOptions: {
              label: 'Select Target Product',
              placeholder: '-- Search Product --',
              required: true,
              lookupKey: 'productTypes', // or productTypesWithVariants
              "filter": true,
    "filterBy": "label", 
    "filterMatchMode": "contains"
            }
          },
          //productVariantId
          //  {
          //   key: 'productVariantId',
          //   type: 'primeng-dropdown',
          //   className: 'col-12 md:col-3',
          //   templateOptions: {
          //     label: 'Select Target Product',
          //     placeholder: '-- Search Product --',
          //     required: true,
          //     lookupKey: 'productTypesWithVariants' // or productTypesWithVariants
          //   }
          // },
          {
            key: 'purchaseUom',
            type: 'input',
            className: 'col-12 md:col-3',
            templateOptions: { label: 'Purchase Unit Name', placeholder: 'e.g. BOX', required: true }
          },
          {
            key: 'saleUom',
            type: 'input',
            className: 'col-12 md:col-3',
            templateOptions: { label: 'Sales Unit Name', placeholder: 'e.g. PCS', required: true }
          },
          {
            key: 'conversionFactor',
            type: 'input',
            className: 'col-12 md:col-3',
            templateOptions: { label: 'Multiplier Factor', min: 0.0001, required: true }
          }
        ]
      }
    ];

    this.fields = this.bindFunctionalHooks(rawJsonConfig);
  }
//   private bindFunctionalHooks(config: any[]): FormlyFieldConfig[] {
//   return config.map(group => {
//     if (group.fieldGroup) {
//       group.fieldGroup = group.fieldGroup.map((field: FormlyFieldConfig) => {
//         // Remove all hooks from here to stop Formly from looping the component creation
//         return field;
//       });
//     }
//     return group;
//   });
// }

private setupProductChangePipeline(): void {
  const productControl = this.form.get('productId');
  if (!productControl) return;

  productControl.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      filter(val => val !== undefined && val !== null),
      // 1. Normalize the coming selection value securely down to a string primitive
      map(val => val && typeof val === 'object' ? String(val.id) : String(val)),
      distinctUntilChanged(),
      // 2. Cross-check against the class property instance right away
      filter(currentId => {
        const activeTrackingId = this.lastEvaluatedProductId !== null ? String(this.lastEvaluatedProductId) : '';
        return currentId !== activeTrackingId;
      })
    )
    .subscribe((normalizedId: string) => {
      console.log(`🎯 Stable Primitive Selection Triggered for Product ID:`, normalizedId);
      
      if (!normalizedId || normalizedId === 'null' || normalizedId === 'undefined') {
        this.existingConversions = [];
        this.lastEvaluatedProductId = null;
        return;
      }

      // 3. Find the parent target item configuration securely inside your array list
      let targetItem: any = null;
      const productsList = (this as any).products; // Use your actual products dataset property here
      if (Array.isArray(productsList)) {
        targetItem = productsList.find((p: any) => String(p.id) === normalizedId) || null;
      }

      if (targetItem) {
        const purchaseUomVal = targetItem.defaultPurchaseUom || targetItem.baseUom || 'BOX';
        const saleUomVal = targetItem.defaultSalesUom || targetItem.baseUom || 'PCS';
        
        // ❌ REMOVED: Do not touch this.model here! 
        // Direct mutations to this.model cause Formly to crash and redraw the template.

        // 4. Update the reactive form instances only. 
        // Formly reads from these controls automatically and keeps its model updated in the background.
        this.form.get('purchaseUom')?.setValue(purchaseUomVal, { emitEvent: false });
        this.form.get('saleUom')?.setValue(saleUomVal, { emitEvent: false });
        this.form.get('conversionFactor')?.setValue(1.0000, { emitEvent: false });
      }

      // 5. Set the state brain property and trigger the backend logic pipeline
      this.lastEvaluatedProductId = Number(normalizedId);
      this.evaluateMatrixPipeline();
    });
}

private bindFunctionalHooks(config: any[]): FormlyFieldConfig[] {
  // Define both target keys
  const targetKeys = ['productId', 'productVariantId'];

  return config.map(group => {
    if (group.fieldGroup) {
      group.fieldGroup = group.fieldGroup.map((field: FormlyFieldConfig) => {
        
        // Check if the current field key matches either of the target keys
        if (field.key && targetKeys.includes(String(field.key))) {
          field.hooks = {
            onInit: (f) => {
              if (!f.formControl) return;
              console.log('m tracker....................................');
              
              // Normalize the field key to a safe string primitive
              const fieldKeyString = String(field.key);

              if (!this.subscribedFieldsTrack) {
                this.subscribedFieldsTrack = new Set<string>();
              }
              if (this.subscribedFieldsTrack.has(fieldKeyString)) return;
              this.subscribedFieldsTrack.add(fieldKeyString);

              f.formControl.valueChanges
                .pipe(
                  takeUntil(this.destroy$),
                  filter(val => val !== undefined),
                  map(val => val && typeof val === 'object' ? String(val.id) : String(val)),
                  distinctUntilChanged(),
                  filter(currentId => {
                    const activeTrackingId = this.lastEvaluatedProductId !== null ? String(this.lastEvaluatedProductId) : '';
                    return currentId !== activeTrackingId;
                  })
                )
                .subscribe((normalizedId: string) => {
                  console.log(`Executing absolute stable sync for ${fieldKeyString}:`, normalizedId);
                  
                  if (!normalizedId || normalizedId === 'null' || normalizedId === 'undefined') {
                    this.existingConversions = [];
                    this.lastEvaluatedProductId = null;
                    return;
                  }

                  let targetItem: any = null;
                  const rawValue = f.formControl!.value;
                  if (typeof rawValue === 'object' && rawValue !== null) {
                    targetItem = rawValue;
                  } else {
                    // Check local cache array dynamically based on the current field key context
                    const listKey = fieldKeyString === 'productVariantId' ? 'productVariants' : 'products';
                    const itemsList = (this as any)[listKey];
                    
                    if (Array.isArray(itemsList)) {
                      targetItem = itemsList.find((p: any) => String(p.id) === normalizedId) || null;
                    }
                  }

                  if (targetItem) {
                    const purchaseUomVal = targetItem.defaultPurchaseUom || targetItem.baseUom || 'BOX';
                    const saleUomVal = targetItem.defaultSalesUom || targetItem.baseUom || 'PCS';
                    
                    if (f.model) {
                      f.model.purchaseUom = purchaseUomVal;
                      f.model.saleUom = saleUomVal;
                      f.model.conversionFactor = 1.0000;
                    }

                    this.form.get('purchaseUom')?.setValue(purchaseUomVal, { emitEvent: false, onlySelf: true });
                    this.form.get('saleUom')?.setValue(saleUomVal, { emitEvent: false, onlySelf: true });
                    this.form.get('conversionFactor')?.setValue(1.0000, { emitEvent: false, onlySelf: true });
                  }
                   
                  this.lastEvaluatedProductId = Number(normalizedId);
                  this.evaluateMatrixPipeline();
                });
            }
          };
        }
        return field;
      });
    }
    return group;
  });
}




//   private bindFunctionalHooks(config: any[]): FormlyFieldConfig[] {
//   return config.map(group => {
//     if (group.fieldGroup) {
//       group.fieldGroup = group.fieldGroup.map((field: FormlyFieldConfig) => {
        
//         if (field.key === 'productId') {
//           field.hooks = {
//             onInit: (f) => {
//               if (!f.formControl) return;
//               console.log('m tracker....................................');
              
//               // Normalize the field key to a safe string primitive to satisfy TypeScript compiler typings
//               const fieldKeyString = field.key !== undefined ? String(field.key) : 'unmapped-layout-group';

//               if (!this.subscribedFieldsTrack) {
//                 this.subscribedFieldsTrack = new Set<string>();
//               }
//               if (this.subscribedFieldsTrack.has(fieldKeyString)) return;
//               this.subscribedFieldsTrack.add(fieldKeyString);

//               f.formControl.valueChanges
//                 .pipe(
//                   takeUntil(this.destroy$),
//                   filter(val => val !== undefined),
//                   map(val => val && typeof val === 'object' ? String(val.id) : String(val)),
//                   distinctUntilChanged(),
//                   filter(currentId => {
//                     const activeTrackingId = this.lastEvaluatedProductId !== null ? String(this.lastEvaluatedProductId) : '';
//                     return currentId !== activeTrackingId;
//                   })
//                 )
//                 .subscribe((normalizedId: string) => {
//                   console.log(`Executing absolute stable sync for Product ID:`, normalizedId);
                  
//                   if (!normalizedId || normalizedId === 'null' || normalizedId === 'undefined') {
//                     this.existingConversions = [];
//                     this.lastEvaluatedProductId = null;
//                     return;
//                   }

//                   let targetItem: any = null;
//                   const rawValue = f.formControl!.value;
//                   if (typeof rawValue === 'object' && rawValue !== null) {
//                     targetItem = rawValue;
//                   } else {
//                     const productsList = (this as any).products;
//                     if (Array.isArray(productsList)) {
//                       targetItem = productsList.find((p: any) => String(p.id) === normalizedId) || null;
//                     }
//                   }

//                   if (targetItem) {
//                     const purchaseUomVal = targetItem.defaultPurchaseUom || targetItem.baseUom || 'BOX';
//                     const saleUomVal = targetItem.defaultSalesUom || targetItem.baseUom || 'PCS';
                    
//                     if (f.model) {
//                       f.model.purchaseUom = purchaseUomVal;
//                       f.model.saleUom = saleUomVal;
//                       f.model.conversionFactor = 1.0000;
//                     }

//                     this.form.get('purchaseUom')?.setValue(purchaseUomVal, { emitEvent: false, onlySelf: true });
//                     this.form.get('saleUom')?.setValue(saleUomVal, { emitEvent: false, onlySelf: true });
//                     this.form.get('conversionFactor')?.setValue(1.0000, { emitEvent: false, onlySelf: true });
//                   }
                   
//                   this.lastEvaluatedProductId = Number(normalizedId);
//                   this.evaluateMatrixPipeline();
//                 });
//             }
//           };
//         }
//         return field;
//       });
//     }
//     return group;
//   });
// }








private evaluateMatrixPipeline(): void {
  const productId = this.form.get('productId')?.value;
  const productVariantId = this.form.get('productVariantId')?.value;
 
  const cleanProductId = productId 
    ? (typeof productId === 'object' ? productId.id : Number(productId)) 
    : null;
  const cleanVariantId = productVariantId 
    ? (typeof productVariantId === 'object' ? productVariantId.id: Number(productVariantId)) 
    : null;
 
  if (!cleanProductId && !cleanVariantId) {
    console.log('Skipping rule evaluation: No Product or Variant identifier selected.');
    return;
  }

  // 🌟 BREAK THE LOOP: If IDs haven't genuinely changed, block the backend call instantly!
  if (this.lastEvaluatedProductId === cleanProductId && this.lastEvaluatedVariantId === cleanVariantId) {
    console.log(`Aborting redundant matrix fetch loop. Identical IDs detected. `); console.log('isDirty is:',this.isDirty);
    
    //return;
  }

  // Update tracking cache variables
  this.lastEvaluatedProductId = cleanProductId;
  this.lastEvaluatedVariantId = cleanVariantId;


  console.log(`🎯 Executing Rule Matrix Engine. Product ID: ${cleanProductId},lastEvaluatedProductId: ${this.lastEvaluatedProductId}, Variant ID: ${cleanVariantId}`);

                this.fetchTenantRulesMatrix(
                  cleanProductId ? Number(cleanProductId) : null, 
                  cleanVariantId ? Number(cleanVariantId) : null
                );
             
}



  fetchTenantRulesMatrix(productId: number|null,productVariantId:number|null): void { console.log('fetching conversions...........for productId:',productId,' lastEvaluatedProductId:'+this.lastEvaluatedProductId+' isDirty:'+this.isDirty);
    
    this.uomService.getConversionsByProduct(this.currentTenantId, productId!,productVariantId!).subscribe({
      next: (data: ConversionRow[]) => {
        console.log(data);
        
        this.existingConversions = data;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch rules matrix.' });
      }
    });
  }

  submitNewRuleRow(): void {
    this.alertMessages = [];

    if (this.form.invalid) {
      this.alertMessages = [{ severity: 'error', summary: 'Validation Failure', detail: 'Please fill out all required fields with valid input parameters.' }];
      return;
    }

    const currentFormValues = this.form.value;
    const selectedProductObj = currentFormValues.productId as Product;

    // Direct string verification match rules matching database structural @Unique constraints
    const duplicateExists = this.existingConversions.some(
      c => c.purchaseUom.trim().toUpperCase() === currentFormValues.purchaseUom!.trim().toUpperCase()
    );

    if (duplicateExists) {
      this.alertMessages = [{ 
        severity: 'warn', 
        summary: 'Constraint Alert', 
        detail: `A conversion mapping track configuration for purchase unit "${currentFormValues.purchaseUom}" already exists.` 
      }];
      return;
    }

    // Explicit payload configuration mapping parameters matching TypeORM Entity requirements
    const payload = {
      tenantId: this.currentTenantId,
      productId: this.model.productId,//selectedProductObj.id!,
      productVariantId: this.model.productVariantId, // explicit null matches type database check rule strings
      purchaseUom: currentFormValues.purchaseUom!.trim().toUpperCase(),
      saleUom: currentFormValues.saleUom!.trim().toUpperCase(),
      conversionFactor: Number(currentFormValues.conversionFactor)
    };

    // Save configuration rules safely to multi-tenant backends via API endpoints
    this.uomService.saveUomConversion(payload).subscribe({
     // Inside submitNewRuleRow -> saveUomConversion subscribe next block:
next: (savedRule: ConversionRow) => {
  this.existingConversions = [...this.existingConversions, savedRule];
  
  this.form.get('purchaseUom')?.reset();
  this.form.get('saleUom')?.reset();
  this.form.get('conversionFactor')?.setValue(1.0000);

  // 🌟 CLEAR TRACKING HERE SO RE-SELECTION WORKS
  this.lastEvaluatedProductId = null;
  this.lastEvaluatedVariantId = null;
  
  this.messageService.add({ severity: 'success', summary: 'Saved Successfully', detail: 'UOM conversion logic mapped.' });
},

      error: (err:any) => {
        this.alertMessages = [{ severity: 'error', summary: 'Database Write Error', detail: err.error?.message || 'Transaction mapping rejected.' }];
      }
    });
  }
}
