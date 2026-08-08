import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { firstValueFrom, forkJoin, tap } from 'rxjs';

import { FormService } from '../../../../core/services/form.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { Customer } from '../../../../core/models/customer.model';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { ClientStatus } from '../../../../shared/enums/ClientStatus.enum';

import { FormlyFieldPrimengDropdownComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyCardWrapperComponent } from '../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyWrapperTypeaheadComponent } from '../../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { RepeatsectionformlyComponent } from '../../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';

import { FilterControlComponent } from '../../../../shared/components/filter-control/filter-control.component';
import { applyLocalSearchExtension, hydrateFormlyConfig } from '../../../../shared/utils/hydrationOfFormlyJson';

import { CustomerFormComponent } from '../shared/customer-form/customer-form.component';
import { CustomerGridComponent } from '../customer-grid/customer-grid.component';
import { ButtonModule } from 'primeng/button';
import { NgxPermissionsModule } from 'ngx-permissions';

@Component({
  selector: 'app-customer-mgr',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule,ButtonModule,
    FilterControlComponent, CustomerFormComponent, CustomerGridComponent, NgxPermissionsModule
  ],
  providers: [MessageService],
  templateUrl: './customer-mgr.component.html',
  styleUrl: './customer-mgr.component.scss'
})
export class CustomerMgrComponent implements OnInit {
  searchInput: any;
  searchString: any;
  visibleDataArray!: any[];
  tenantId!: number;
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode;
  currOpMode: FormOpMode = FormOpMode.View;
  customerDetailsRequired: boolean = true;
  clientstatus: ClientStatus = ClientStatus.NewLead;
  raw: any;

  form = new FormGroup({});
  model: any = {
    tenantId: 0, customerName: '', customerCategory: '', customer_autocode: '',
    clientStatus: ClientStatus.NewLead, leadSource: '', commercialContactPerson:'',commercialContactPhone: '', EmailId: '',
    city: '', creditDays: 0, creditLimit: 0, sites: []
  };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  customers: Customer[] | undefined = [];
  expandedRows: { [id: number]: boolean } = {};

  private formService = inject(FormService);
  private customerService = inject(CustomerService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private lookupService = inject(LookupService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.registerFormlyExtensions();
    this.getForm_Customer();
  }

  private registerFormlyExtensions(): void {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });
  }

  onDataFiltered(filteredResults: any[]) {
    this.visibleDataArray = filteredResults;
  }
  getForm_Customer() {
    this.formService.getForm(this.tenantId!, 'customer_form').subscribe(aform => {
      this.aForm = aform;
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });

    // this.raw = [
    //   { "key": "id", "type": "input", "hide": true },
    //   { "key": "createdByUserId", "type": "input", "hide": true },
    //   { "key": "tenantId", "type": "input", "hide": true },
    //   {
    //     "type": "input",
    //     "hide": true,
    //     "key": "clientStatus",
    //     "props": { "label": "clientStatus", "placeholder": "Enter clientStatus", "required": true }
    //   },
    //   {
    //     "wrappers": ["panel"],
    //     "className": "col-span-24 w-full block mb-0",
    //     "props": {},
    //     "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
    //     "fieldGroup": [
    //       {
    //         "key": "customerName",
    //         "type": "input",
    //         "className": "col-span-7 md:col-span-6",
    //         "props": { "label": "Client Name", "placeholder": "Enter client name", "required": true }
    //       },
    //       {
    //         "type": "primeng-dropdown",
    //         "key": "customerCategoryId",
    //         "className": "col-span-6 md:col-span-4",
    //         "props": {
    //           "label": "Client Type", "valueProp": "value", "labelProp": "label",
    //           "optionLabel": "label", "optionValue": "value", "placeholder": "Select Category",
    //           "lookupKey": "customerCategoryTypes", "required": true, "filter": true
    //         }
    //       },
    //       {
    //         "type": "input",
    //         "key": "commercialContactPerson",
    //         "resetOnHide": true,
    //         "className": "col-span-6 md:col-span-4",
    //         "props": { "label": "commercialContactPerson", "description": "aaaa", "placeholder": "Enter commercialContactPerson", "searchable": true },
    //         "validation": { "messages": { "required": "This field cannot be left blank." } },
    //         "modelOptions": { "updateOn": "blur" }
    //       },
          
          

    //       {
    //         "type": "input",
    //         "key": "commercialContactPhone",
    //         "resetOnHide": true,
    //         "className": "col-span-6 md:col-span-4",
    //         "props": { "label": "commercialContactPhone", "description": "aaaa", "placeholder": "e.g. +1-555-123-4567", "searchable": true },
    //         "validation": { "messages": { "required": "This field cannot be left blank." } },
    //         "modelOptions": { "updateOn": "blur" }
    //       },
    //       {
    //         "type": "primeng-dropdown",
    //         "key": "leadSource",
    //         "className": "col-span-5 md:col-span-6",
    //         "props": { "label": "Source", "optionLabel": "label", "optionValue": "value", "placeholder": "Select LeadSource", "lookupKey": "leadSourceTypes", "filter": true }
    //       },
    //       {
    //         "type": "input",
    //         "key": "EmailId",
    //         "className": "col-span-6 md:col-span-4",
    //         "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email", "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", "searchable": true }
    //       },
    //       {
    //         "type": "primeng-dropdown",
    //         "key": "city",
    //         "className": "col-span-6 md:col-span-4",
    //         "props": { "label": "City", "valueProp": "value", "labelProp": "label", "optionLabel": "label", "optionValue": "value", "placeholder": "Select City", "lookupKey": "cityTypes", "filter": true }
    //       },
    //       { "key": "creditDays", "type": "input", "className": "col-span-6 md:col-span-2", "props": { "label": "CreditDays" } },
    //       { "key": "creditLimit", "type": "input", "className": "col-span-6 md:col-span-2", "props": { "label": "CreditLimit" } }
    //     ]
    //   },
    //   {
    //     "key": "sites",
    //     "type": "p-repeatsectionformly",
    //     "wrappers": ["panel"],
    //     "defaultValue": [],
    //     "props": { "label": "", "addText": "Add site" },
    //     "fieldArray": {
    //       "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
    //       "fieldGroup": [
    //         { "key": "id", "type": "input", "hide": true },
    //         { "key": "tenantId", "type": "input", "hide": true },
    //         { "key": "clientId", "type": "input", "hide": true },
    //         { "type": "input", "key": "siteName", "className": "col-span-12 md:col-span-10", "props": { "placeholder": "Enter name" }, "expressions": { "props.label": "field.parent.index === 0 ? 'Site name' : ''" } },
    //         { "type": "input", "key": "siteContactPerson", "className": "col-span-12 md:col-span-10", "props": { "placeholder": "Enter Contact Person" }, "expressions": { "props.label": "field.parent.index === 0 ? 'Site Contact Person' : ''" } }
    //       ]
    //     }
    //   },
    //   { "type": "button", "className": "col-span-12 md:col-span-3 mt-4", "props": { "text": "Save Customer", "type": "submit", "styleClass": "p-button-success" } }
    // ];

    forkJoin({
      mobileData: this.customerService.getMobileNumbersLookup(this.tenantId),
      emailData: this.customerService.getEmailIDLookup(this.tenantId)
    }).subscribe({
      next: ({ mobileData, emailData }) => {
        const normalizedMobileNumbers = mobileData.map(item => ({ id: item.commercialContactPhone || item.id, commercialContactPhone: item.commercialContactPhone, name: item.commercialContactPhone }));
        const normalizedEmailIds = emailData.map(item => ({ id: item.EmailId || item.id, EmailId: item.EmailId, name: item.EmailId }));
        const dataSources = { commercialContactPhone: normalizedMobileNumbers, emailIds: normalizedEmailIds };
        
        const hydrated = hydrateFormlyConfig(this.raw);
        this.fields = hydrated;
        applyLocalSearchExtension(this.fields, dataSources);
      },
      error: (error) => console.error('Error fetching lookup data', error)
    });

    this.getCustomerList();
  }

  getCustomerList(): Promise<any[]> {
    const observable$ = this.customerService.getCustomers(this.tenantId).pipe(
      tap((custs: any) => {
        this.visibleDataArray = [...custs];
        this.customers = JSON.parse(JSON.stringify(custs)); 
        this.cd.markForCheck();
        this.cd.detectChanges();
      })
    );
    return firstValueFrom(observable$);
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    this.clientstatus = ClientStatus.NewLead;
    this.customerDetailsRequired = false;
    this.form.reset();

    this.model = {
      id: 0, tenantId: this.tenantId, customerName: '', customerCategory: '', customer_autocode: '',
      clientStatus: ClientStatus.NewLead, leadSource: '', commercialContactPerson:'',commercialContactPhone: '', EmailId: '',
      city: '', creditDays: 0, creditLimit: 0, sites: []
    };
  }

  async onEditClick(selectedRecord: any) {
    console.log('...selectedRecord.....:',selectedRecord);
    
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update; 
    localStorage.setItem('currOpMode', this.currOpMode);
    
    const cleaned = {
      ...selectedRecord,
      sites: selectedRecord.sites?.map((org: any) => ({
        ...org,
        customerDetailsRequired: true,
        customerCategory: org.customerCategory?.value ?? org.customerCategory
      })) ?? []
    };

    this.model = cleaned;

    setTimeout(() => {
      try {
        this.form.patchValue(cleaned);
      } catch (error) {
        console.error('Error during formly alignment:', error);
      }
      this.cd.markForCheck();
      this.cd.detectChanges();
    }, 50);
  }

  async saveCustomer() {
    if (!this.form.valid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Leak Detected', 
        detail: 'Please configure mandatory fields correctly before syncing details.' 
      });
      return;
    }

    const rawFormValue = this.form.value as any;
    const modelSites = this.model?.sites || [];

    const normalizedSites = (rawFormValue.sites || []).map((formSite: any, index: number) => {
      const existingModelSite = modelSites[index];
      return {
        ...formSite,
        id: formSite.id || existingModelSite?.id || null,
        tenantId: this.tenantId 
      };
    });

    const submissionPayload = {
      ...this.model,
      ...rawFormValue,
      sites: normalizedSites, 
      tenantId: this.tenantId
    };

    try {
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        await firstValueFrom(this.customerService.updateCustomer(submissionPayload.id, submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Updated Successfully', detail: 'Customer and sites updated.' });
      } else {
        await firstValueFrom(this.customerService.createCustomer(submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Creation Success', detail: 'Customer profile registered successfully.' });
      }

      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();
      await this.getCustomerList();
      this.cd.detectChanges();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Database Write Rejected', detail: error.message || 'Error saving context.' });
    }
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }

    updateCategoryInRow(rowIndex: number, newValue: string = 'Dealer') {
    // 🚀 FIX: Route type-casting through 'unknown' first to clear the strict compilation rule
    const sitesArray = (this.form.get('sites') as unknown) as FormArray;

    if (sitesArray && sitesArray.length > rowIndex) {
      // Safely resolve the inner FormGroup element
      const rowGroup = sitesArray.at(rowIndex) as FormGroup;
      
      if (rowGroup) {
        const categoryControl = rowGroup.get('customerCategory');
        if (categoryControl) {
          categoryControl.setValue(newValue);
          categoryControl.markAsDirty();
          categoryControl.updateValueAndValidity();
        }
      }
    }
  }


  private patchForm(record: any) {
    const cleaned = {
      ...record,
      sites: record.sites?.map((org: any) => ({
        ...org,
        customerCategory: org.customerCategory?.value ?? org.customerCategory
      })) ?? []
    };
    this.model = cleaned;
    this.form.setValue(this.model);
  }

  toggleRow(rowData: Customer) { 
    this.expandedRows[rowData.id] = !this.expandedRows[rowData.id];
  }

  removeCustomer(index: number) {
    this.customers?.splice(index, 1);
    this.visibleDataArray = [...(this.customers ?? [])];
  }

  clearCustomer() {
this.form.reset();
}

}