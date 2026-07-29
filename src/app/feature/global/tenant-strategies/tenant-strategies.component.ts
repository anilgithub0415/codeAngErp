
// src/app/feature/settings/tenant-strategies/tenant-strategies.component.ts (Part 1)
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, Input, OnInit } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormlyInputModule } from "@ngx-formly/primeng/input";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { RippleModule } from "primeng/ripple";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { FilterControlComponent } from "../../../shared/components/filter-control/filter-control.component";
import { FormOpMode } from "../../../shared/enums/FormOpMode.enum";
import { FormService } from "../../../core/services/form.service";
import { TenantStrategyService,TenantStrategy } from "../../../core/services/tenant-strategy.service";
import { AuthService } from "../../../core/services/auth.service";
import { FormlyCardWrapperComponent } from "../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component";
import { hydrateFormlyConfig } from "../../../shared/utils/hydrationOfFormlyJson";
import { firstValueFrom, tap } from "rxjs";

@Component({
  selector: 'app-tenant-strategies',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule,
    FormlyModule, InputTextModule, FormlyInputModule, PanelModule, 
    TableModule, RippleModule, ButtonModule, FilterControlComponent
  ],
  providers: [MessageService],
  templateUrl: './tenant-strategies.component.html',
  styleUrl: './tenant-strategies.component.scss'
})
export class TenantStrategiesComponent implements OnInit {
  visibleDataArray: TenantStrategy[] = [];
  @Input() tenantId!: number;
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  form = new FormGroup({});
  model: TenantStrategy = { id: 0, tenantId: 0, tenantStrategyName: '', tenantStrategy: '' };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;
  strategies: TenantStrategy[] = []; 

  private formService = inject(FormService);
  private strategyService = inject(TenantStrategyService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });

    this.getForm_TenantStrategies();
    this.refreshStrategyList().catch(err => console.error('Error fetching baseline layout grid details:', err));
  }
// src/app/feature/settings/tenant-strategies/tenant-strategies.component.ts (Part 2)
  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    this.form.reset();
    this.model = { id: 0, tenantId: this.tenantId, tenantStrategyName: '', tenantStrategy: '' };
  }

  async onEditClick(selectedRecord: TenantStrategy) {
    console.log('Record targeted for update layout execution:', selectedRecord);
    this.model = { ...selectedRecord };
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update;

    setTimeout(() => {
      try {
        this.form.patchValue(this.model);
      } catch (error) {
        console.error('Error applying runtime field patching cycles:', error);
      }
      this.cd.detectChanges();
    }, 50);
  }

  async saveStrategy() {
    if (!this.form.valid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Strategy Name and Strategy properties are required fields.' 
      });
      return;
    }

    const submissionPayload = {
      ...this.model,
      ...this.form.value,
      tenantId: this.tenantId
    };

    try {
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        console.log('Routing PUT modification pipeline details matching target key:', submissionPayload);
        await firstValueFrom(this.strategyService.updateStrategy(this.tenantId,submissionPayload.id, submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Strategy details updated successfully' });
      } else {
        console.log('Routing generic configuration creation POST pipeline...');
        await firstValueFrom(this.strategyService.createStrategy(this.tenantId,submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Strategy registered successfully' });
      }

      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();
      
      await this.refreshStrategyList();
      this.cd.detectChanges();
    } catch (error: any) {
      console.error('Data pipeline write sequence anomaly identified:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.message || 'Failed to apply strategy variable context changes.' 
      });
    }
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }

  clearStrategy() {
    this.form.reset();
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  refreshStrategyList(): Promise<any> {
    const observable$ = this.strategyService.getStrategies(this.tenantId).pipe(
      tap((data: TenantStrategy[]) => {
        this.strategies = data;
        this.visibleDataArray = [...this.strategies];
        console.log('All tracking strategies updated successfully:', data);
      })
    );
    return firstValueFrom(observable$);
  }

  getForm_TenantStrategies() {
    this.formService.getForm(this.tenantId!, 'tenant_strategies_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });
       
    this.raw = [
      { "key": "id", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      { "key": "createdByUserId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "tenantStrategyName",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Strategy Structural Name",
              "placeholder": "Enter descriptive strategy name",
              "required": true
            }
          },
          {
            "type": "input",
            "key": "tenantStrategy",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Strategy Expression Value",
              "placeholder": "Enter configuration expression",
              "required": true
            }
          }
        ]
      }
    ];

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 
    console.log('Formly schema configuration layouts compiled successfully.');
  }
}
