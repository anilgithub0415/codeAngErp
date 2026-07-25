import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { LineDiscount } from '../../../core/models/line-discount.model';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import { LineDiscountService } from '../../../core/services/line-discount.service';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { hydrateFormlyConfig } from '../../../shared/utils/hydrationOfFormlyJson';
import { firstValueFrom, tap } from 'rxjs';
import { DiscountTypeService } from '../../../core/services/discount-type.service';

@Component({
  selector: 'app-line-discount',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    SelectModule, InputTextModule, PanelModule, TableModule, RippleModule, 
    ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './line-discount.component.html',
  styleUrl: './line-discount.component.scss'
})
export class LineDiscountComponent implements OnInit {
  visibleDataArray!: any[];
  tenantId!: number;          
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  discounts: LineDiscount[] | undefined = []; 

  private formService = inject(FormService);
  private lineDiscountService = inject(LineDiscountService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
private discountTypeService = inject(DiscountTypeService);
  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.resetModel();
    this.tenantId = this.authServ.getTenantId()!;   

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent }); 
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });
 
    this.getForm_LineDiscount();
    this.refreshGrid();
  }

  private resetModel() {
    this.model = { 
      id: 0, 
      tenantId: 0, 
      discountCode: '', 
      description: '', 
      discountType: 'PERCENTAGE', 
      discountValue: 0,
      productId: null,
      categoryId: null
    };
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    this.resetModel();
    this.form.reset(this.model);
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }

  async onEditClick(selectedRecord: any) {
    setTimeout(() => {
      this.isFormHidden = false;
      this.currOpMode = FormOpMode.Update; 
      localStorage.setItem('currOpMode', this.currOpMode);
      this.model = { ...selectedRecord };
      this.form.patchValue(this.model);
      this.cd.detectChanges();
    }, 100);
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  /**
   * Evaluated validation target dropdown state event handler hook definition
   */
  onProductDropdownChange(field: FormlyFieldConfig) {
    field.formControl?.valueChanges.subscribe(value => {
      console.log(`[LineDiscountComponent] Selected targeted ERP Product Identification context link: ${value}`);
    });
  }


getForm_LineDiscount() {
  this.formService.getForm(this.tenantId!, 'line_discount_form').subscribe(aform => {
    this.aForm = aform; 
    this.raw = JSON.parse(this.aForm.FormlyConfig);
  });
     
  this.raw = [
    { "key": "id", "type": "input", "hide": true },
    { "key": "createdByUserId", "type": "input", "hide": true },
    { "key": "tenantId", "type": "input", "hide": true },
    {
      "wrappers": ["panel"],
      "className": "col-span-12 w-full block mb-0",
      "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
      "fieldGroup": [
        {
          "type": "input",
          "key": "discountCode",
          "className": "col-span-12 md:col-span-3",
          "props": { "label": "Discount Code", "placeholder": "e.g MOP20", "required": true }
        },
        {
          "type": "primeng-dropdown",
          "key": "productId",
          "className": "col-span-12 md:col-span-3",
          "props": { 
            "optionLabel": "label", 
            "optionValue": "value", 
            "placeholder": "Select Item", 
            "lookupKey": "productTypes", 
            "required": true, 
            "filter": true 
          },
          "expressions": { 
            "props.label": "field.parent.index === 0 ? 'Item' : 'Target Item'" 
          },
          "hooks": { 
            "onInit": (field:any) => this.onProductDropdownChange(field) 
          }
        },
        {
          // 💡 Dynamic Dropdown Field linked directly to master table configuration rules
          "type": "primeng-dropdown",
          "key": "discountType",
          "className": "col-span-12 md:col-span-3",
          "props": { 
            "label": "Discount Logic Strategy Type",
            "optionLabel": "label", 
            "optionValue": "value", 
            "placeholder": "Select Strategy Rule", 
            "lookupKey": "discountStrategyTypes", // Binds option lookups via shared configuration
            "required": true, 
            "filter": false 
          }
        },
        {
          "type": "input",
          "key": "discountValue",
          "className": "col-span-12 md:col-span-3",
          "props": { "label": "Discount Value", "placeholder": "0.00", "required": true }
        },
        {
          "type": "input",
          "key": "description",
          "className": "col-span-12 md:col-span-12",
          "props": { "label": "Description / Notes", "placeholder": "Enter notes or applicability terms" }
        }
      ]
    }
  ];

  this.fields = hydrateFormlyConfig(this.raw); 
}


  getDiscountList(): Promise<any[]> {
    const observable$ = this.lineDiscountService.getDiscounts(this.tenantId).pipe(
      tap((discnts: any) => {
        this.discounts = discnts; 
        this.visibleDataArray = [...this.discounts!];
      })
    );
    return firstValueFrom(observable$);
  }

  async refreshGrid() {
    try {
      await this.getDiscountList();
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error fetching discounts:', err);
    }
  }

  async saveDiscount() {
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Validation failed' });
      return;
    }

    const payload = { ...this.form.value, tenantId: this.tenantId };
    const savedOpMode = this.currOpMode; 

    this.isFormHidden = true;
    this.currOpMode = FormOpMode.View;

    try {
    // Look for this section inside saveDiscount():
if (savedOpMode === FormOpMode.Update) {
  // 💡 Cast the observable response using <any> or <LineDiscount> to prevent strict template array assignment alerts
  await firstValueFrom<any>(this.lineDiscountService.updateDiscount(this.model.id, payload));
  this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Discount configuration altered successfully' });
} else {
  await firstValueFrom<any>(this.lineDiscountService.createDiscount(payload));
  this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Discount registered successfully' });
}

     
      await this.refreshGrid();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed processing request' });
      this.isFormHidden = false;
      this.currOpMode = savedOpMode;
    }
  }

  removeDiscount(index: number) {
    this.discounts?.splice(index, 1);
  }

  clearForm() {
    this.form.reset();
  }
}
