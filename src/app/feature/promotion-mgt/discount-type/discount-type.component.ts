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

import { DiscountType } from '../../../core/models/discount-type.model';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import { DiscountTypeService } from '../../../core/services/discount-type.service';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { hydrateFormlyConfig } from '../../../shared/utils/hydrationOfFormlyJson';
import { firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-discount-type',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    SelectModule, InputTextModule, PanelModule, TableModule, RippleModule, 
    ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './discount-type.component.html',
  styleUrl: './discount-type.component.scss'
})
export class DiscountTypeComponent implements OnInit {
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
  discountTypes: DiscountType[] | undefined = []; 

  private formService = inject(FormService);
  private discountTypeService = inject(DiscountTypeService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);

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
 
    this.getForm_DiscountType();
    this.refreshGrid();
  }

  private resetModel() {
    this.model = { 
      id: 0, 
      tenantId: 0, 
      typeName: '', 
      description: '', 
      isActive: true
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

  getForm_DiscountType() {
    this.formService.getForm(this.tenantId!, 'discount_type_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });
       
    // Local Framework Formly configuration fields fallback map
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
            "key": "typeName",
            "className": "col-span-12 md:col-span-4",
            "props": { "label": "Strategy Type Name", "placeholder": "e.g. PERCENTAGE", "required": true }
          },
          {
            "type": "input",
            "key": "description",
            "className": "col-span-12 md:col-span-6",
            "props": { "label": "Description Notes", "placeholder": "Enter rule use criteria detail context" }
          },
          {
            "type": "checkbox",
            "key": "isActive",
            "className": "col-span-12 md:col-span-2 mb-2",
            "props": { "label": "Is Active" }
          }
        ]
      }
    ];

    this.fields = hydrateFormlyConfig(this.raw); 
  }

  getDiscountTypeList(): Promise<any[]> {
    const observable$ = this.discountTypeService.getDiscountTypes(this.tenantId).pipe(
      tap((types: any) => {
        this.discountTypes = types; 
        this.visibleDataArray = [...this.discountTypes!];
      })
    );
    return firstValueFrom(observable$);
  }

  async refreshGrid() {
    try {
      await this.getDiscountTypeList();
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error fetching discount types:', err);
    }
  }

  async saveDiscountType() {
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Form validation requirements failed' });
      return;
    }

    const payload = { ...this.form.value, tenantId: this.tenantId };
    const savedOpMode = this.currOpMode; 

    this.isFormHidden = true;
    this.currOpMode = FormOpMode.View;

    try {
      if (savedOpMode === FormOpMode.Update) {
        await firstValueFrom(this.discountTypeService.updateDiscountType(this.model.id, payload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Strategy template modified successfully' });
      } else {
        await firstValueFrom(this.discountTypeService.createDiscountType(payload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Strategy rule type registered successfully' });
      }
     
      await this.refreshGrid();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Operation failed' });
      this.isFormHidden = false;
      this.currOpMode = savedOpMode;
    }
  }

  removeDiscountType(index: number) {
    this.discountTypes?.splice(index, 1);
  }

  clearForm() {
    this.form.reset();
  }
}
