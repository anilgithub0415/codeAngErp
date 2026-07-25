
import { ChangeDetectorRef, Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Select, SelectModule } from 'primeng/select';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { firstValueFrom } from 'rxjs';

import { FormService } from '../../../../../core/services/form.service';
import { InteractionService } from '../../../../../core/services/interaction.service';
import { Interaction } from '../../../../../core/models/interaction.model';
import { AuthService } from '../../../../../core/services/auth.service';
import { FormOpMode } from '../../../../../shared/enums/FormOpMode.enum';
import { FilterControlComponent } from '../../../../../shared/components/filter-control/filter-control.component';
import { FormlyCardWrapperComponent } from '../../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldButtonComponent } from '../../../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { hydrateFormlyConfig, applyLocalSearchExtension } from '../../../../../shared/utils/hydrationOfFormlyJson';

@Component({
  selector: 'app-interaction-log',standalone:true,
  imports: [
   CommonModule, 
    ToastModule, 
    ReactiveFormsModule, 
    FormsModule,
    FormlyModule, 
    SelectModule, 
    InputTextModule, 
    FormlyInputModule,
    PanelModule, 
    TableModule, 
    RippleModule, 
    ButtonModule, 
    FilterControlComponent

  ],
  providers: [MessageService],
  templateUrl: './interaction-log.component.html',
  styles: []
})
export class InteractionLogComponent implements OnInit {
  @Input() currentCustomerId!: number; // Passed directly from Dashboard or Kanban selections
  @Input() activeTenantId: number = 1;  // Context scoping fallback matching your defaults

  userId!:number;
  visibleDataArray!: any[];
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode;
  currOpMode: FormOpMode = FormOpMode.View;
  raw: any;
  aForm!: any;

  form = new FormGroup({});

   private formService = inject(FormService);
  private interactionService = inject(InteractionService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);


  model = {
    interactionId: 0,
    customerId: 0,
    userId: 0, // Defaulting context placeholder
    channel: '',
    direction: 'Outbound',
    purpose: '',
    notes: '',
    isSampleFeedback: false,
    attachmentUrl: '',
    nextFollowUpDate: '',
    nextFollowUpObjective: ''
  };
  fields: FormlyFieldConfig[] = [];
  interactions: Interaction[] | undefined = [];

 
  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.userId=this.authServ.getUserId()!;
    this.resetModel();

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });

    this.buildInteractionFormFields();
    this.loadHistoryGrid();
  }

  private resetModel() {
    this.model = {
      interactionId: 0,
      customerId: this.currentCustomerId,
      userId: this.userId, 
      channel: '',
      direction: 'Outbound',
      purpose: '',
      notes: '',
      isSampleFeedback: false,
      attachmentUrl: '',
      nextFollowUpDate: '',
      nextFollowUpObjective: ''
    };
  }

  onDataFiltered(filteredResults: any[]) {
    this.visibleDataArray = filteredResults;
  }

  private loadHistoryGrid() {
    if (!this.currentCustomerId) return;
    
    firstValueFrom(this.interactionService.getInteractions(this.currentCustomerId, this.activeTenantId))
      .then(data => {
        this.interactions = data;
        this.visibleDataArray = [...this.interactions!];
        this.cd.detectChanges();
      })
      .catch(err => console.error('Failed timeline hydration:', err));
  }

  buildInteractionFormFields() {
    this.raw = [
      { "key": "interactionId", "type": "input", "hide": true },
      { "key": "customerId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": { "title": "Log Communication Activity" },
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "primeng-dropdown",
            "key": "channel", 
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Interaction Channel", 
              "valueProp": "value", 
              "labelProp": "label",
              "placeholder": "Select Channel (e.g. Call/WhatsApp)",
              "lookupKey": "InteractionChannelTypes",  
              "required": true
            }
          },
          {
            "type": "primeng-dropdown",
            "key": "purpose", 
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Interaction Purpose", 
              "valueProp": "value", 
              "labelProp": "label",
              "placeholder": "Select Purpose",
              "lookupKey": "InteractionPurposeTypes",  
              "required": true
            }
          },
          {
            "type": "input",
            "key": "direction",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Direction (Inbound/Outbound)",
              "required": true
            }
          },
          {
            "type": "input",
            "key": "notes",
            "className": "col-span-12 md:col-span-12",
            "props": {
              "label": "Summary Conversation Notes",
              "placeholder": "Note detail here (e.g., Mop quality verified, sent prices for floor cleaner)",
              "required": true
            }
          },
          {
            "type": "checkbox",
            "key": "isSampleFeedback",
            "className": "col-span-12 md:col-span-4 mb-2",
            "props": {
              "label": "Includes Product Sample Review Feedback"
            }
          },
          {
            "type": "input",
            "key": "attachmentUrl",
            "className": "col-span-12 md:col-span-8",
            "props": {
              "label": "Document/Attachment URL Link",
              "placeholder": "URL string for associated quote sheet or broken batch pictures"
            }
          }
        ]
      },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": { "title": "Next Follow-Up Scheduling Link" },
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "nextFollowUpDate",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Follow Up Target Date",
              "type": "date"
            }
          },
          {
            "type": "input",
            "key": "nextFollowUpObjective",
            "className": "col-span-12 md:col-span-8",
            "props": {
              "label": "Follow Up Actions Objective",
              "placeholder": "What should the rep track on next contact?"
            }
          }
        ]
      }
    ];

    const dataSources = { mobileNumber: [], customerName: [] };
    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated;
    applyLocalSearchExtension(this.fields, dataSources);

    this.formService.getForm(0, 'interaction_form').subscribe(aform => {
        if(aform) {
          this.aForm = aform;
          this.raw = JSON.parse(this.aForm.FormlyConfig);
        }
    });
  }

  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.resetModel();
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
      this.form.patchValue(this.model);
      this.cd.detectChanges();
    }, 500);
  }

      async saveInteraction() {
    if (!this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Required fields missing' });
      return;
    }

    try {
      const payload = { ...this.model, ...this.form.value };
console.log('payload.channel:',payload.channel);

      // 1. CRITICAL DATATYPE CORRECTION: Safely map numeric ID selections back to character strings
      // if (payload.channel === 1 || payload.channel === '1') payload.channel = 'Call';
      // if (payload.purpose === 1 || payload.purpose === '1') payload.purpose = 'Price Negotiation';

      // 2. Format check blank date picks to prevent datetime2 compilation errors
      if (!payload.nextFollowUpDate || payload.nextFollowUpDate.toString().trim() === '') {
        payload.nextFollowUpDate = '';
      }
console.log('........payload...............',payload);

      if (this.currOpMode === FormOpMode.Add) {
        payload.customerId = this.currentCustomerId; 
        await firstValueFrom(this.interactionService.createInteraction(this.activeTenantId, payload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Communication logged successfully' });
      } else if (this.currOpMode === FormOpMode.Update) {
        await firstValueFrom(this.interactionService.updateInteraction(payload.interactionId, this.activeTenantId, payload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Log entry modified' });
      }

      this.currOpMode = FormOpMode.View;
      this.isFormHidden = true;
      this.loadHistoryGrid();
    } catch (error: any) {
      console.error('Operation failed', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to write interaction metrics: ' + error.message });
    }
  }


    async removeInteraction(id: number, index: number) {
    try {
      // Execute multi-tenant safe backend removal
      await firstValueFrom(this.interactionService.deleteInteraction(id, this.activeTenantId));
      
      // Update local memory collection reference to reflect the change instantly
      this.interactions?.splice(index, 1);
      this.visibleDataArray = [...this.interactions!];
      
      this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Communication log entry removed' });
      this.cd.detectChanges();
    } catch (error) {
      console.error('Delete failed', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not remove entity interaction log' });
    }
  }

    clearInteraction() {
    this.form.reset();
    this.resetModel();
    this.cd.detectChanges();
  }


}
