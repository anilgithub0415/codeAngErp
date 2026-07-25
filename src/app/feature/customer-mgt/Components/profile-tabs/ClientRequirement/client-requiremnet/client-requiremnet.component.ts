import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormOpMode } from '../../../../../../shared/enums/FormOpMode.enum';
import { AuthService } from '../../../../../../core/services/auth.service';
import { ClientRequirementService } from '../../../../../../core/services/client-requirement.service';
import { IClientRequirement,RequirementFrequency } from '../../../../../../core/models/client-requirement.model';
import { FormlyCardWrapperComponent } from '../../../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDatepickerComponent } from '../../../../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { hydrateFormlyConfig } from '../../../../../../shared/utils/hydrationOfFormlyJson';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-client-requirement',imports: [
    ReactiveFormsModule, 
    FormsModule, 
    FormlyModule, 
    CommonModule, 
    TableModule, 
    ButtonModule, 
    InputNumberModule, 
    InputTextModule, 
    ToastModule, 
    FormlyPrimeNGModule
  ],
  providers: [MessageService],
  templateUrl: './client-requiremnet.component.html',
  styleUrl: './client-requiremnet.component.scss'
})
export class ClientRequiremnetComponent implements OnInit {
  @Input() clientId!:number;
  tenantId!: number;
  requirements: IClientRequirement[] = [];
  expandedRows: { [id: number]: boolean } = {};
  currOpMode: FormOpMode = FormOpMode.View;
  isFormHidden: boolean = true;
  form = new FormGroup({});
  
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  rawBlueprint: any[] = [];

  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private clientReqService = inject(ClientRequirementService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.registerCustomFormlyEngineExtensions();
    this.generateFormlyJSONBlueprint();
    this.compileAndHydrateFields();
    this.loadRequirementsList();
    this.resetModelToDefault();
  }

  private registerCustomFormlyEngineExtensions(): void {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'datepicker', component: FormlyFieldPrimengDatepickerComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
  }

  private generateFormlyJSONBlueprint(): void {
    this.rawBlueprint = [
      { key: 'id', type: 'input', hide: true },
      { key: 'tenantId', type: 'input', hide: true },
      { key: 'createdByUserId', type: 'input', hide: true },
      {
        wrappers: ['panel'],
        className: 'col-span-24 w-full block mb-2',
        fieldGroupClassName: 'grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4',
        fieldGroup: [
           {
            "type": "primeng-dropdown",
            "key": "clientId", 
            "className": "col-span-12 md:col-span-6",
            "props": {"label": "Lead / Customer", "valueProp": "value", 
              "styleClass": "w-full", "labelProp": "label", "optionLabel": "label","optionValue": "value", "placeholder": "Select Customer",
              "lookupKey": "customerTypes",  "required": true, "filter": true }
          },{
            type: 'input',
            key: 'specialRequirement',
            className: 'col-span-24 md:col-span-6',
            props: { label: 'Special Brand Preferences', placeholder: 'e.g., Hindware, Jaquar' }
          },
          {
            type: 'input',
            key: 'packingRequirement',
            className: 'col-span-12 md:col-span-6',
            props: { label: 'Packing Configuration', placeholder: 'e.g., Wooden pallets, bubble wrap' }
          },
          {
            type: 'input',
            key: 'deliveryRequirement',
            className: 'col-span-12 md:col-span-6',
            props: { label: 'Logistics Preference', placeholder: 'e.g., Tail-lift vehicle delivery' }
          },
          {
            type: 'input',
            key: 'expectedBudget',
            className: 'col-span-12 md:col-span-6',
            props: { type: 'number', label: 'Expected Project Estimate (₹)', min: 0, required: true }
          },
          {
            type: 'input',
            key: 'monthlyBudget',
            className: 'col-span-12 md:col-span-6',
            props: { type: 'number', label: 'Target Monthly Value (₹)', min: 0, required: true }
          },
          {
            type: 'input',
            key: 'remarksNotes',
            className: 'col-span-24 md:col-span-12',
            props: { label: 'Internal Notes', placeholder: 'Add customer tracking internal notes...' }
          }
        ]
      },
      {
        key: 'items',
        type: 'p-repeatsectionformly',
        wrappers: ['panel'],
        defaultValue: [],
        props: {
          label: 'Material Allocation Line Matrices',
          addText: 'Add Material Specification Line',
          rowDefaults: { approxQuantity: 1, unit: 'PCS', frequency: RequirementFrequency.ONE_TIME }
        },
        fieldArray: {
          fieldGroupClassName: 'grid grid-cols-24 gap-4 w-full p-fluid items-end',
          fieldGroup: [
            { key: 'id', type: 'input', hide: true },
            //productCetegoryTypes
          //    {
          //   "type": "primeng-dropdown",
          //   "key": "productCategory", 
          //   "className": "col-span-12 md:col-span-6",
          //   "props": {"label": "Category", "valueProp": "value", 
          //     "styleClass": "w-full", "labelProp": "label", "optionLabel": "label","optionValue": "value", "placeholder": "Select Customer",
          //     "lookupKey": "productCetegoryTypes",  "required": true, "filter": true }
          // },
            {
              type: 'input',
              key: 'productCategory',
              className: 'col-span-24 md:col-span-5',
              props: { placeholder: 'Select/Enter Category', required: true },
              expressions: { 'props.label': "field.parent.index === 0 ? 'Product Category' : ''" }
            },
            //productTypes
          //   {
          //   "type": "primeng-dropdown",
          //   "key": "productName", 
          //   "className": "col-span-12 md:col-span-6",
          //   "props": {"label": "Product Detail ", "valueProp": "value", 
          //     "styleClass": "w-full", "labelProp": "label", "optionLabel": "label","optionValue": "value", "placeholder": "Select Customer",
          //     "lookupKey": "productTypes",  "required": true, "filter": true }
          // },
            {
              type: 'input',
              key: 'productName',
              className: 'col-span-24 md:col-span-6',
              props: { placeholder: 'SKU Code or Item Designation', required: true },
              expressions: { 'props.label': "field.parent.index === 0 ? 'Product Detail Spec / SKU' : ''" }
            },
            {
              type: 'input',
              key: 'approxQuantity',
              className: 'col-span-12 md:col-span-3',
              props: { type: 'number', placeholder: 'Qty', required: true, min: 0 },
              expressions: { 'props.label': "field.parent.index === 0 ? 'Quantity' : ''" }
            },
            {
              type: 'input',
              key: 'unit',
              className: 'col-span-12 md:col-span-3',
              props: { placeholder: 'PCS, BOX, SET', required: true },
              expressions: { 'props.label': "field.parent.index === 0 ? 'UOM Pack' : ''" }
            },
            {
              type: 'primeng-dropdown',
              key: 'frequency',
              className: 'col-span-24 md:col-span-4',
              props: {
                placeholder: 'Select Frequency Interval',
                optionLabel: 'label',
                optionValue: 'value',
                required: true,
                options: [
                  { label: 'One Time', value: RequirementFrequency.ONE_TIME },
                  { label: 'Weekly', value: RequirementFrequency.WEEKLY },
                  { label: 'Monthly', value: RequirementFrequency.MONTHLY },
                  { label: 'Regular', value: RequirementFrequency.REGULAR },
                  { label: 'Contract', value: RequirementFrequency.CONTRACT }
                ]
              },
              expressions: { 'props.label': "field.parent.index === 0 ? 'Demand Frequency' : ''" }
            }
          ]
        }
      }
    ];
  }

  private compileAndHydrateFields(): void {
    this.fields = hydrateFormlyConfig(this.rawBlueprint);
  }

  async loadRequirementsList(): Promise<void> {
    try {
      this.requirements = await firstValueFrom(this.clientReqService.getClientRequirements(this.tenantId,this.clientId));
      this.cd.detectChanges();
    } catch (err: any) {
      this.showToast('error', 'Execution Error', err.message || 'Failed loading profiles.');
    }
  }

  private resetModelToDefault(): void {
    this.model = {
      id: 0,
      tenantId: this.tenantId,
      specialRequirement: '',
      packingRequirement: '',
      deliveryRequirement: '',
      expectedBudget: 0,
      monthlyBudget: 0,
      remarksNotes: '',
      items: []
    };
  }

  Add(): void {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.form.reset();
    this.resetModelToDefault();
    this.cd.detectChanges();
  }

  async onEditClick(selectedRecord: any): Promise<void> {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update;
    localStorage.setItem('currOpMode', this.currOpMode);

    this.form = new FormGroup({});
    const clonedRecord = JSON.parse(JSON.stringify(selectedRecord));
    
    this.model = {
      ...clonedRecord,
      items: clonedRecord.items || []
    };

    setTimeout(() => {
      try {
        this.form.patchValue(this.model);
      } catch (error) {
        console.error('Form patches allocation failure context:', error);
      }
      this.cd.detectChanges();
    }, 100);
  }

  CancelFormOp(): void {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
    this.resetModelToDefault();
    this.cd.detectChanges();
  }

  clearForm(): void {
    this.resetModelToDefault();
    this.form.reset();
    this.cd.detectChanges();
  }

  async saveRequirement(): Promise<void> {
    if (!this.form.valid) {
      this.showToast('error', 'Execution Truncated', 'Validation checks failed.');
      return;
    }

    const processedFormValue = { ...this.form.value };
    const cleanPayload = {
      ...this.model,
      ...processedFormValue,
      tenantId: this.tenantId
    };

    if (!Array.isArray(cleanPayload.items) || cleanPayload.items.length === 0) {
      this.showToast('error', 'Schema Violation', 'Must include at least one item line.');
      return;
    }

    cleanPayload.expectedBudget = Number(cleanPayload.expectedBudget || 0);
    cleanPayload.monthlyBudget = Number(cleanPayload.monthlyBudget || 0);
    cleanPayload.items = cleanPayload.items.map((item: any) => ({
      ...item,
      approxQuantity: Number(item.approxQuantity || 0)
    }));

    try {
      if (this.currOpMode === FormOpMode.Add) {
        await firstValueFrom(this.clientReqService.createClientRequirementClean(cleanPayload));
        this.showToast('success', 'Transaction Saved', 'Fresh Profile committed.');
      } else if (this.currOpMode === FormOpMode.Update) {
        await firstValueFrom(this.clientReqService.updateClientRequirement(cleanPayload.id, cleanPayload));
        this.showToast('success', 'Transaction Updated', 'Profile modified successfully.');
      }
      
      this.CancelFormOp();
      await this.loadRequirementsList();
    } catch (err: any) {
      this.showToast('error', 'Persistence Failure', err.error?.message || err.message);
    }
  }

  private showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}