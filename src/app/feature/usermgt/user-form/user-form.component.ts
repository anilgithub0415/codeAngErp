import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { ButtonModule } from 'primeng/button';
import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../core/services/form.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormlyModule, FormlyInputModule, ButtonModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() modelData: any = null;
  @Input() tenantId!: number;
  @Input() isFormHidden: boolean = true;
  @Input() currOpMode: FormOpMode = FormOpMode.View;

  @Output() save = new EventEmitter<{ formValues: any; baseModel: any }>();
  @Output() cancel = new EventEmitter<void>();

  readonly FormOpMode = FormOpMode;
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  raw: any;

  private formService = inject(FormService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.buildFormFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelData']) {
      if (this.modelData) {
        this.model = { ...this.modelData };
        setTimeout(() => {
          try {
            this.form.patchValue(this.model);
          } catch (error) {
            console.error('Error during formly patch assignment:', error);
          }
          this.cd.detectChanges();
        }, 50);
      } else {
        this.resetModel();
        this.form.reset();
      }
    }
  }

  resetModel() {
    this.model = {
      id: 0,
      tenantId: this.tenantId || 0,
      userName: '', password: '',
      displayName: '',
      clientId: null,
      siteId: null,
      assignedRoles: [],
      userAbbrevation: '',
      firstName: '',
      lastName: '',
      contactEmail: '',
      contactPhone: '',
      deviceInfo: ''
    };
  }

  saveUser() {
    this.save.emit({
      formValues: this.form.value,
      baseModel: this.model
    });
  }

  clearUser() {
    this.form.reset();
    this.resetModel();
  }

  CancelFormOp() {
    this.cancel.emit();
  }

  buildFormFields() {
    if (this.tenantId) {
      this.formService.getForm(this.tenantId, 'user_form').subscribe(aform => {
        if (aform && aform.formlyConfig) {
          this.raw = JSON.parse(aform.formlyConfig);
        }
      });
    }

    this.fields = [
      { "key": "id", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          { 
            "key": "userName", 
            "type": "input", 
            "className": "col-span-12 md:col-span-3", 
            "props": { "label": "User Name", "placeholder": "Enter Username", "required": true } 
          },
          { 
            "key": "password", 
            "type": "input", 
            "className": "col-span-12 md:col-span-3", 
            "props": { "label": "Password", "placeholder": "Enter password", "required": true } 
          },
          { 
            "key": "displayName", 
            "type": "input", 
            "className": "col-span-12 md:col-span-3", 
            "props": { "label": "User Display Name", "placeholder": "Enter Display Name" } 
          },
          {
            "type": "primeng-multiselect",
            "key": "assignedRoles",
            "className": "col-span-12 md:col-span-6",
            "props": {
              "label": "Assign System Roles",
              "placeholder": "Select Context Roles",
              "required": true, "multiple": true,
              "filter": true,
              "optionLabel": "label",
              "optionValue": "value",
              "lookupKey": "roleTypes" 
            }
          },
          {
            "type": "primeng-dropdown",
            "key": "clientId", 
            "className": "col-span-12 md:col-span-6",
            "props": {
              "label": "Client",
              "styleClass": "w-full", 
              "optionLabel": "label",
              "optionValue": "value",
              "placeholder": "Select Customer",
              "filter": true,
              "lookupKey": "customerTypes" 
            },
            "expressions": {
              "hide": "!model.assignedRoles?.includes('Client') && !model.assignedRoles?.includes('Site_Supervisor')",
              "props.required": "model.assignedRoles?.includes('Site_Supervisor') || model.assignedRoles?.includes('Client')"
            }
          },
          {
            "type": "primeng-dropdown",
            "key": "siteId", 
            "className": "col-span-12 md:col-span-6",
            "props": {
              "label": "Site",
              "styleClass": "w-full", 
              "optionLabel": "label",
              "optionValue": "value",
              "placeholder": "Select Site",
              "filter": true,
              "lookupKey": "customerWithFirmTypes" 
            },
            "expressions": {
              "hide": "!model.assignedRoles?.includes('Site_Supervisor')",
              "props.required": "model.assignedRoles?.includes('Site_Supervisor')"
            }
          }
        ]
      }
    ];
  }
}
