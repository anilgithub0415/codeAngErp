
import { Component, OnInit, ChangeDetectorRef, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig, FormlyConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { HSNTaxRuleService } from '../../../core/services/hsntaxrule.service';// Adjust path to your Hsn Service
import { ProductCategory, ProductCategoryService } from '../../../core/services/product-category.service';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { RepeatsectionformlyComponent } from '../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { hydrateFormlyConfig } from '../../../shared/utils/hydrationOfFormlyJson';
import { firstValueFrom, tap } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-product-category',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    SelectModule, InputTextModule, PanelModule, TableModule, RippleModule, 
    ButtonModule, FilterControlComponent, ConfirmDialogModule
  ],
  providers: [MessageService,ConfirmationService],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.scss'
})
export class ProductCategoryComponent implements OnInit {
  visibleDataArray!: any[];
  tenantId!: number;          
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  form = new FormGroup({});
  model: any = { id: 0, tenantId: 0, categoryName: '', description: '', defaultHsnId: null, isActive: true };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  categories: ProductCategory[] | undefined = [];
  hsnOptions: any[] = []; // Caches master options for the dropdown choice array

  private formService = inject(FormService);
  private categoryService = inject(ProductCategoryService);
  private hsnService = inject(HSNTaxRuleService); // Injected to populate Formly configuration lookup lists
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
private confirmationService = inject(ConfirmationService);
  constructor(private cd: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    this.resetModel();
    this.tenantId = this.authServ.getTenantId()!;   

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent }); 
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });
 
    await this.loadHsnOptions();
    this.getForm_Category();
    this.refreshGrid();
  }

  private resetModel() {
    this.model = { id: 0, tenantId: 0, categoryName: '', description: '', defaultHsnId: null, isActive: true };
  }

  private async loadHsnOptions() {
    try {
      // Pulls global HSN codes list to drive the helper shortcut selection
      const data = await firstValueFrom(this.hsnService.getHSNTaxRules());
      this.hsnOptions = data.map((h: any) => ({
        label: `${h.hsnCode} - ${h.description} (${h.igstRate}%)`,
        value: h.id
      }));
    } catch (err) {
      console.error('Failed to load HSN configuration entries:', err);
    }
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
      this.patchForm(this.model);
      this.cd.detectChanges();
    }, 100);
  }

  private patchForm(record: any) {
    this.form.patchValue(record);
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  getForm_Category() {
    // Dynamic schema definition block incorporating HSN selection configurations
    this.raw = [
      { "key": "id", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "categoryName",
            "className": "col-span-12 md:col-span-4",
            "props": { "label": "Category Name", "placeholder": "e.g., Mops & Wipers", "required": true }
          },
          {
            "type": "input",
            "key": "description",
            "className": "col-span-12 md:col-span-4",
            "props": { "label": "Description", "placeholder": "Enter category details", "required": false }
          },
          {
            "type": "primeng-dropdown",
            "key": "defaultHsnId",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Suggested Default HSN Code",
              "placeholder": "Select default tax rule mapping",
              "options": this.hsnOptions,
              "required": false
            }
          }
        ]
      }
    ];

    this.fields = hydrateFormlyConfig(this.raw); 
  }

  getCategoryList(): Promise<any[]> {
    const observable$ = this.categoryService.getCategories(this.tenantId).pipe(
      tap((cats: any) => {
        this.categories = cats; 
        this.visibleDataArray = [...this.categories!];
      })
    );
    return firstValueFrom(observable$);
  }

  async refreshGrid() {
    try {
      await this.getCategoryList();
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  async saveCategory() {
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Validation rules failed.' });
      return;
    }

    const payload = { ...this.form.value, tenantId: this.tenantId };
    const savedOpMode = this.currOpMode; 

    this.isFormHidden = true;
    this.currOpMode = FormOpMode.View;

    try {
      if (savedOpMode === FormOpMode.Update) {
        await firstValueFrom(this.categoryService.updateCategory(this.model.id, payload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Category updated successfully' });
      } else {
        await firstValueFrom(this.categoryService.createCategory(payload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Category created successfully' });
      }
     
      await this.refreshGrid();
    } catch (error: any) {
      console.error('Save operation failed:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to complete save sequence' });
      
      this.isFormHidden = false;
      this.currOpMode = savedOpMode;
    }
  }

  // removeCategory(index: number) {
  //   this.categories?.splice(index, 1);
  // }
removeCategory(category: any) {
  this.confirmationService.confirm({
    message: `Are you sure you want to permanently delete the category "${category.categoryName}"?`,
    header: 'Delete Category Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      
      // Execute backend removal sequence
      this.categoryService.deleteCategory(this.tenantId, category.id).subscribe({
        next: () => {
          // SUCCESS PATH: Filter the array safely only on a successful backend response
          this.categories = this.categories!.filter(c => c.id !== category.id);
          
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Deleted', 
            detail: 'Category successfully removed.' 
          });
        },
        error: (err) => {
          // Combined string fallback to bypass undefined err.status behaviors
          const errorPayloadString = JSON.stringify(err) + (err?.message || '');
          
          // FAILURE PATH: Intercept the database constraint violation safely
          if (errorPayloadString.includes('409') || errorPayloadString.includes('REFERENCE constraint')) {
            this.messageService.add({ 
              severity: 'warn', // Visual anchor point for user notification
              summary: 'Deletion Blocked', 
              detail: 'Cannot delete this category. It is currently linked to active products in your catalog.',
              life: 6000 
            });
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'System Error', 
              detail: 'An unexpected system error occurred while attempting deletion.' 
            });
          }
        }
      });
      
    }
  });
}

  clearCategory() {
    this.form.reset();
  }
}
