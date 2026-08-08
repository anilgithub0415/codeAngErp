// src/app/features/subscription-plan/subscription-plan.component.ts
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

import { FormService } from '../../../../core/services/form.service';
import { SubscriptionPlanLookupService, SubscriptionPlanLookup } from '../../../../core/services/subscription-plan-lookup.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { FilterControlComponent } from '../../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyWrapperTypeaheadComponent } from '../../../../shared/components/formlyfields/formly-wrapper-typeahead/formly-wrapper-typeahead.component';
import { FormlyFieldButtonComponent } from '../../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { hydrateFormlyConfig, applyLocalSearchExtension } from '../../../../shared/utils/hydrationOfFormlyJson';

@Component({
  selector: 'app-subscription-plan',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule,
    FormlyModule, SelectModule, InputTextModule, FormlyInputModule,
    PanelModule, TableModule, RippleModule, ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.scss'
})
export class SubscriptionPlanComponent implements OnInit {
  visibleDataArray!: any[];
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode;
  currOpMode: FormOpMode = FormOpMode.View;
  raw: any;
  aForm!: any;

  form = new FormGroup({});
  model = { planName: '' };
  fields: FormlyFieldConfig[] = [];

  subscriptionPlans: SubscriptionPlanLookup[] | undefined = [];

  private formService = inject(FormService);
  private subscriptionPlanLookupService = inject(SubscriptionPlanLookupService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private lookupService = inject(LookupService);
  private messageService = inject(MessageService);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.model = { planName: '' };

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setWrapper({ name: 'typeahead-wrapper', component: FormlyWrapperTypeaheadComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });

    this.getForm_SubscriptionPlan();
    this.getSubscriptionPlanList().then(data => {
      this.subscriptionPlans = data;
      this.visibleDataArray = [...this.subscriptionPlans!];
    }).catch((err: any) => {
      console.error('Initialization Error:', err);
    });
  }

  onDataFiltered(filteredResults: any[]) {
    this.visibleDataArray = filteredResults;
    console.log('onDataFiltered count:', this.visibleDataArray.length);
  }

  getForm_SubscriptionPlan() {
    this.raw = [
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "planName",
            "className": "col-span-12 md:col-span-6",
            "props": {
              "label": "Plan Name",
              "placeholder": "Enter subscription plan name",
              "required": true
            }
          }
        ]
      },
      {
        "type": "button",
        "className": "col-span-12 md:col-span-3 mt-4",
        "props": {
          "text": "Save Plan",
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

    this.formService.getForm(0, 'subscription_plan_form').subscribe(aform => {
    
        this.aForm = aform;
        this.raw = JSON.parse(this.aForm.FormlyConfig);
    
    });
  }

  getSubscriptionPlanList(): Promise<any[]> {
    const observable$ = this.subscriptionPlanLookupService.getSubscriptionPlans().pipe(
      tap((data: any) => {
        this.subscriptionPlans = data;
        console.log('All subscription plans fetched:', data);
      })
    );
    return firstValueFrom(observable$);
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.model = { planName: '' };
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
  }

  async onEditClick(selectedRecord: any) {
    console.log('Selected record for edit:', selectedRecord);
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

  async saveSubscriptionPlan() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Plan Name is required' });
      return;
    }

    try {
      await firstValueFrom(this.subscriptionPlanLookupService.createSubscriptionPlan(this.model));
      this.getSubscriptionPlanList().then(data => {
        this.subscriptionPlans = data;
        this.visibleDataArray = [...this.subscriptionPlans!];
        this.cd.detectChanges();
      });
      console.log('Saved entry structure:', this.model);
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Subscription plan configuration recorded successfully' });
    } catch (error) {
      console.error('Save failed', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to record plan configuration' });
    }
  }

  removeSubscriptionPlan(index: number) {
    this.subscriptionPlans?.splice(index, 1);
    this.visibleDataArray = [...this.subscriptionPlans!];
  }

  clearSubscriptionPlan() {
    this.form.reset();
  }
}
