
// src/app/features/leadsource/leadsource.component.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { firstValueFrom, tap } from 'rxjs';

import { FormService } from '../../../core/services/form.service';
import { LeadsourceService, Leadsource } from '../../../core/services/leadsource.service';
import { AuthService } from '../../../core/services/auth.service';
import { LookupService } from '../../../core/services/lookup.service';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FilterControlComponent } from '../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { hydrateFormlyConfig, applyLocalSearchExtension } from '../../../shared/utils/hydrationOfFormlyJson';

@Component({
  selector: 'app-leadsource',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule,
    FormlyModule, SelectModule, InputTextModule, FormlyInputModule,
    PanelModule, TableModule, RippleModule, ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './leadsource.component.html',
  //styleUrl: './leadsource.component.scss'
})
export class LeadsourceComponent implements OnInit {
  visibleDataArray!: any[];
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode;
  currOpMode: FormOpMode = FormOpMode.View;
  raw: any;
  aForm!: any;

  form = new FormGroup({});
  model = { id: 0, tenantId: 1, leadSource: '', createdByUserId: 0 };
  fields: FormlyFieldConfig[] = [];

  leadsources: Leadsource[] | undefined = [];

  private formService = inject(FormService);
  private leadsourceService = inject(LeadsourceService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private lookupService = inject(LookupService);
  private messageService = inject(MessageService);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.model = { id: 0, tenantId: 1, leadSource: '', createdByUserId: 0 };

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });

    this.getForm_Leadsource();
    this.getLeadsourceList().then(data => {
      this.leadsources = data;
      this.visibleDataArray = [...this.leadsources!];
    }).catch((err: any) => {
      console.error('Initialization Error:', err);
    });
  }

  onDataFiltered(filteredResults: any[]) {
    this.visibleDataArray = filteredResults;
    console.log('onDataFiltered count:', this.visibleDataArray.length);
  }

  getForm_Leadsource() {
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
            "key": "leadSource",
            "className": "col-span-12 md:col-span-6",
            "props": {
              "label": "Lead Source Name",
              "placeholder": "Enter lead source description",
              "required": true
            }
          }
        ]
      },
      {
        "type": "button",
        "className": "col-span-12 md:col-span-3 mt-4",
        "props": {
          "text": "Save Leadsource",
          "type": "submit",
          "styleClass": "p-button-success"
        }
      }
    ];

    const dataSources = {
      mobileNumber: [],
      customerName: []
    };

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated;
    applyLocalSearchExtension(this.fields, dataSources);

    this.formService.getForm(0, 'leadsource_form').subscribe(aform => {
      this.aForm=this.aForm;
    //  if (aform && aform.FormlyConfig) {
    //    this.aForm = aform;
        this.raw = JSON.parse(this.aForm.FormlyConfig);
    //  }
    });
  }

  getLeadsourceList(): Promise<any[]> {
    const observable$ = this.leadsourceService.getLeadsources().pipe(
      tap((data: any) => {
        this.leadsources = data;
        console.log('All leadsources fetched:', data);
      })
    );
    return firstValueFrom(observable$);
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.model = { id: 0, tenantId: 1, leadSource: '', createdByUserId: 0 };
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
  }

  async onEditClick(selectedRecord: any) {
   
    await setTimeout(() => {
      this.isFormHidden = false;
      this.currOpMode = FormOpMode.Update;
      localStorage.setItem('currOpMode', this.currOpMode);
      this.model = { ...selectedRecord };
      this.patchForm(selectedRecord);
      this.cd.detectChanges();
    }, 2000);
  }

  private patchForm(record: any) {
    this.form.patchValue(record);
  }

  async saveLeadsource() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Lead source name description fields are required' });
      return;
    }

    try {
      await firstValueFrom(this.leadsourceService.createLeadsource(this.model));
      this.getLeadsourceList().then(data => {
        this.leadsources = data;
        this.visibleDataArray = [...this.leadsources!];
        this.cd.detectChanges();
      });
      console.log('Saved entry structure:', this.model);
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Leadsource configuration recorded successfully' });
    } catch (error) {
      console.error('Save failed', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to record entry configurations' });
    }
  }

  removeLeadsource(index: number) {
    this.leadsources?.splice(index, 1);
    this.visibleDataArray = [...this.leadsources!];
  }

  clearLeadsource() {
    this.form.reset();
  }
}
