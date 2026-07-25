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

import { Vendor } from '../../../core/models/vendor.model';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { VendorService } from '../../../core/services/vendor.service';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { applyLocalSearchExtension, hydrateFormlyConfig } from '../../../shared/utils/hydrationOfFormlyJson';
import { firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-vendor',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    SelectModule, InputTextModule, PanelModule, TableModule, RippleModule, 
    ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.scss'
})
export class VendorComponent implements OnInit {
  visibleDataArray!: any[];
  tenantId!: number;          
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  form = new FormGroup({});
  model: any = { id: 0, tenantId: 0, vendorName: '', description: '' };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  vendors: Vendor[] | undefined = []; 

  private formService = inject(FormService);
  private vendorService = inject(VendorService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private lookupService = inject(LookupService);
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
 
    this.getForm_Vendor();
    this.refreshGrid();
  }

  private resetModel() {
    this.model = { id: 0, tenantId: 0, vendorName: '', description: '' };
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
    console.log('selectedRecord for edit:', selectedRecord);
    setTimeout(() => {
      this.isFormHidden = false;
      this.currOpMode = FormOpMode.Update; 
      localStorage.setItem('currOpMode', this.currOpMode);
      
      // Shallow copy object so modifications don't instantly show in data row grid preview before clicking save
      this.model = { ...selectedRecord };
      this.patchForm(this.model);
      this.cd.detectChanges();
    }, 100); // Reduced delay for crisp UI navigation loops
  }

  private patchForm(record: any) {
    this.form.patchValue(record);
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  getForm_Vendor() {
    this.formService.getForm(this.tenantId!, 'customer_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });
       
    // Local fallback payload definition
    this.raw = [
      { "key": "id", "type": "input", "hide": true },
      { "key": "createdByUserId", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "vendorName",
            "className": "col-span-12 md:col-span-3",
            "props": { "label": "Vendor Name", "placeholder": "Enter vendorName", "required": true }
          },
          {
            "type": "input",
            "key": "description",
            "className": "col-span-12 md:col-span-3",
            "props": { "label": "Description", "placeholder": "Enter description", "required": true }
          }
        ]
      },
      {
        "type": "button",
        "className": "col-span-12 md:col-span-3 mt-4",
        "props": { "text": "Save Vendor", "type": "submit", "styleClass": "p-button-success" }
      }
    ];

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 
   // applyLocalSearchExtension(this.fields);
  }

  getVendorList(): Promise<any[]> {
    const observable$ = this.vendorService.getVendors(this.tenantId).pipe(
      tap((vendrs: any) => {
        this.vendors = vendrs; 
        this.visibleDataArray = [...this.vendors!];
      })
    );
    return firstValueFrom(observable$);
  }

  async refreshGrid() {
    try {
      await this.getVendorList();
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  }

  /**
   * Refactored Dynamic Action Handler electing POST vs PUT routing logic automatically
   */
  async saveVendor() {
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Vendor Form validation rules failed' });
      return;
    }

    const payload = { ...this.form.value, tenantId: this.tenantId };
    const savedOpMode = this.currOpMode; // Cache active working context state

    // Instantly collapse form section layout interface options 
    this.isFormHidden = true;
    this.currOpMode = FormOpMode.View;

    try {
      if (savedOpMode === FormOpMode.Update) {
        // Run PUT sequence logic execution path patterns
        await firstValueFrom(this.vendorService.updateVendor(this.model.id, payload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Vendor updated successfully' });
      } else {
        // Run POST sequence logic execution path patterns
        await firstValueFrom(this.vendorService.createVendor(payload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Vendor created successfully' });
      }
     
      await this.refreshGrid();
    } catch (error: any) {
      console.error('Save operation failed completely:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to complete save sequence' });
      
      // Rollback interface window layers if processing faults out
      this.isFormHidden = false;
      this.currOpMode = savedOpMode;
    }
  }

  removeVendor(index: number) {
    this.vendors?.splice(index, 1);
  }

  clearVendor() {
    this.form.reset();
  }
}
