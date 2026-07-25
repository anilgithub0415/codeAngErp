
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { FormlyConfig } from '@ngx-formly/core';
import { firstValueFrom } from 'rxjs';

import { FormOpMode } from '../../../shared/enums/FormOpMode.enum';
import { User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

import { UserFormComponent } from '../user-form/user-form.component';
import { UserGridComponent } from '../user-grid/user-grid.component';

import { FormlyCardWrapperComponent } from '../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldButtonComponent } from '../../../shared/components/formlyfields/formly-field-button/formly-field-button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-mgr',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule, UserFormComponent, UserGridComponent, FormsModule],
  providers: [MessageService],
  templateUrl: './user-mgr.component.html',
  styleUrl: './user-mgr.component.scss'
})
export class UserMgrComponent implements OnInit {
  tenantId!: number;
  users: User[] = [];
  visibleDataArray: any[] = [];
  
  isFormHidden: boolean = true;
  readonly FormOpMode = FormOpMode;
  currOpMode: FormOpMode = FormOpMode.View;
  
  selectedModel: any = null;

  public authServ = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private formlyConfig = inject(FormlyConfig);//  CORRECT: Explicitly typed to the instance of ChangeDetectorRef
private cd: ChangeDetectorRef;

constructor(private changeDetector: ChangeDetectorRef) {
  this.cd = changeDetector;
}


  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.configureFormlyGlobalTypes();
    this.loadUsers();
  }

  private configureFormlyGlobalTypes() {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'button', component: FormlyFieldButtonComponent });
    this.formlyConfig.setType({ name: 'primeng-multiselect', component: FormlyFieldPrimengDropdownComponent });
  }

  async loadUsers() {
    try {
      console.log('tenantid:',this.tenantId);
      
      const response = await firstValueFrom(this.userService.getUsers(this.tenantId));
      this.users = response || [];
      this.visibleDataArray = this.users.map((auser: any) => ({
        ...auser,
        customerName: auser.clientName || '-',
        siteName: auser.siteName || '-'
      }));
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  onAddRequested() {
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add;
    localStorage.setItem('currOpMode', this.currOpMode);
    this.selectedModel = null; // Forces form to reset to clean defaults
  }

  onEditRequested(userRecord: any) {
    this.selectedModel = { ...userRecord };
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update;
    localStorage.setItem('currOpMode', this.currOpMode);
  }

  async onSaveUser(payload: { formValues: any; baseModel: any }) {
    const { formValues, baseModel } = payload;
    
    if (!formValues?.userName || !formValues?.displayName) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'User Name and Display Name are mandatory fields.'
      });
      return;
    }

    const submissionPayload: any = {
      ...baseModel,
      ...formValues,
      tenantId: this.tenantId,
      tenant: baseModel?.tenant || null
    };

    try {
      if (this.currOpMode === FormOpMode.Update && submissionPayload.id) {
        await firstValueFrom(this.userService.updateUser(submissionPayload.id, submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'User profile updated successfully.' });
      } else {
        await firstValueFrom(this.userService.createUserClean(submissionPayload));
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'New user registered successfully.' });
      }

      this.closeFormView();
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

  async onDeleteUser(event: { id: number; rowIndex: number }) {
    try {
      await firstValueFrom(this.userService.removeUser(event.id));
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User removed completely.' });
      await this.loadUsers();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Deletion execution cycle failed.' });
    }
  }

  onFormCancelled() {
    this.closeFormView();
  }

  private closeFormView() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
    this.selectedModel = null;
  }
}
