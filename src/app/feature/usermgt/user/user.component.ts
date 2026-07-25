import { CommonModule } from "@angular/common";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormlyInputModule } from "@ngx-formly/primeng/input";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { RippleModule } from "primeng/ripple";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { FilterControlComponent } from "../../../shared/components/filter-control/filter-control.component";
import { MessageService } from "primeng/api";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormOpMode } from "../../../shared/enums/FormOpMode.enum";
import { NgxPermissionsService } from 'ngx-permissions';

import { FormService } from "../../../core/services/form.service";
import { UserService } from "../../../core/services/user.service";
import { AuthService } from "../../../core/services/auth.service";
import { LookupService } from "../../../core/services/lookup.service";
import { FormlyCardWrapperComponent } from "../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component";
import { FormlyFieldPrimengDropdownComponent } from "../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component";
import { FormlyFieldButtonComponent } from "../../../shared/components/formlyfields/formly-field-button/formly-field-button.component";
import { firstValueFrom } from "rxjs";
import { User } from "../../../core/models/user.model";


@Component({
  selector: 'app-user',
  imports: [CommonModule, ToastModule, ReactiveFormsModule, FormsModule,
    FormlyModule, InputTextModule, FormlyInputModule,
    PanelModule, TableModule, RippleModule, ButtonModule,
    FilterControlComponent],
  providers: [MessageService],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  visibleDataArray!: any[];
  tenantId!: number;          
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 
  raw: any;

  form = new FormGroup({});
  model = {
    id: 0,
    tenantId: 0,
    userName: '',password:'',
    displayName: '',
    clientId: null as number | null,
    siteId: null as number | null,
    assignedRoles: [] as string[], // 👈 Updated to handle a collection of parallel role names
    userAbbrevation: '',
    firstName: '',
    lastName: '',
    contactEmail: '',
    contactPhone: '',
    deviceInfo: ''
  };
  
  fields: FormlyFieldConfig[] = [];
  users: User[] | undefined = []; 

  private formService = inject(FormService);
  private userService = inject(UserService);
  private formlyConfig = inject(FormlyConfig);
  public authServ = inject(AuthService);
  private lookupService = inject(LookupService);
  private messageService = inject(MessageService);
  private permissionService = inject(NgxPermissionsService);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.resetModel();
    this.tenantId = this.authServ.getTenantId()!;   

    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });
 this.formlyConfig.setType({name:'primeng-multiselect',component:FormlyFieldPrimengDropdownComponent})
    this.getForm_User();
    this.loadUsers();
  }

  resetModel() {
    this.model = {
      id: 0,
      tenantId: this.tenantId || 0,
      userName: '',password:'',
      displayName: '',
      clientId: null,
      siteId: null,
      assignedRoles: [], // 👈 Clean state initialisation
      userAbbrevation: '',
      firstName: '',
      lastName: '',
      contactEmail: '',
      contactPhone: '',
      deviceInfo: ''
    };
  }

  async loadUsers_preserve() {
    try {
      this.users = await firstValueFrom(this.userService.getUsers(this.tenantId));
      this.visibleDataArray = [...this.users!]; 
      console.log('all users:',this.users);
      
      
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }
async loadUsers() {
  try {
    const response = await firstValueFrom(this.userService.getUsers(this.tenantId));
    this.users = response || [];
    
    this.visibleDataArray = this.users.map((auser: any) => ({
      ...auser,
      // Uses the new properties returned from the backend update
      customerName: auser.clientName || '-',
      siteName: auser.siteName || '-'
    }));
    
    console.log('Processed table users:', this.visibleDataArray);
    this.cd.detectChanges();
  } catch (err) {
    console.error('Error fetching users:', err);
  }
}



  Add() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    this.form.reset();
    this.resetModel();
  }

  async onEditClick(selectedRecord: any) {
    this.model = { ...selectedRecord }; console.log('model:',this.model);
    
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update; 
    localStorage.setItem('currOpMode', this.currOpMode);

    setTimeout(() => {
      try {
        this.form.patchValue(this.model);
      } catch (error) {
        console.error('Error during formly patch assignment:', error);
      }
      this.cd.detectChanges();
    }, 50); 
  }
  async saveUser() {
    const formValues = this.form.value as any;
    const userName = formValues?.userName;
    const displayName = formValues?.displayName;

    if (!userName || !displayName){
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'User Name and Display Name are mandatory fields.' 
      });
      return;
    }

    const submissionPayload: any = {
      ...this.model,
      ...formValues,
      tenantId: this.tenantId,
      tenant: (this.model as any).tenant || null 
    };
console.log('saving user object:',submissionPayload);

    try {
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        await firstValueFrom(this.userService.updateUser(submissionPayload.id, submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'User profile updated successfully.' });
      } else {
        console.log('creating user:',submissionPayload);
        
        await firstValueFrom(this.userService.createUserClean(submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'New user registered successfully.' });
      }

      this.currOpMode = FormOpMode.View; 
      this.isFormHidden = true;
      this.form.reset();
      await this.loadUsers();
    } catch (error: any) {
      console.error('User persistence mutation pipeline failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Database Write Failed', 
        detail: error.message || 'Failed to sync user records.' 
      });
    }
  }

  clearUser() {
    this.form.reset();
    this.resetModel();
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;
  }

  async deleteUser(id: number, rowIndex: number) {
    try {
      await firstValueFrom(this.userService.removeUser(id));
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User removed completely.' });
      await this.loadUsers();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Deletion execution cycle failed.' });
    }
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
  }

  getForm_User() {
    this.formService.getForm(this.tenantId!, 'user_form').subscribe(aform => {
      if (aform && aform.formlyConfig) {
        this.raw = JSON.parse(aform.formlyConfig);
      }
    });

    const hasPermission = (perm: string) => !!this.permissionService.getPermission(perm);

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
        "props": { "label": "User Nameeeeeeeeeeeeeee", "placeholder": "Enter Username", "required": true } 
      },
      //password
      { 
        "key": "password", 
        "type": "input", 
        "className": "col-span-12 md:col-span-3", 
        "props": { "label": "password", "placeholder": "Enter password", "required": true } 
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
          "required": true, "multiple":true,
          "filter": true,
          "optionLabel": "label",
          "optionValue": "value",
          "lookupKey":"roleTypes" 
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
          "lookupKey":"customerTypes" 
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
          "lookupKey":"customerWithFirmTypes" 
        },
        "expressions": {
          "hide": "!model.assignedRoles?.includes('Site_Supervisor')",
          "props.required": "model.assignedRoles?.includes('Site_Supervisor')"
        }
      }
    ]
  }
]

  }
}
