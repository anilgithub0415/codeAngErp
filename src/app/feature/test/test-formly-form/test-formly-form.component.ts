
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyModule } from '@ngx-formly/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { FormlyPrimeNGModule } from '@ngx-formly/primeng'; // OR if using PrimeNG

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber'; // For numerical IDs if needed
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown'; // For selecting roles
import { CheckboxModule } from 'primeng/checkbox'; // For isActive
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-test-formly-form',
  standalone:true,
  imports: [ReactiveFormsModule,FormsModule,FormlyModule,FormlyPrimeNGModule, InputTextModule,DropdownModule,
    CommonModule,
    FormsModule,
    // PrimeNG Modules
    TableModule,
    ButtonModule,DropdownModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    DropdownModule, // Added
    CheckboxModule, // Added
    // RatingModule, TextareaModule, SelectModule, RadioButtonModule (removed as not directly applicable to user CRUD)
    NgxPermissionsModule,],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './test-formly-form.component.html',
  styleUrl: './test-formly-form.component.scss'
})
export class TestFormlyFormComponent {

  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = []; // Initialize as empty, will be fetched

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch the form schema from your Node.js backend
    this.http.get<FormlyFieldConfig[]>('/form-schemas/student-enrollment')
      .subscribe(schema => {
        this.fields =  schema; //refer sample json below
 
      }, error => {
        console.error('Error fetching form schema:', error);
        // Handle error, maybe load a default static schema or show a message
      });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.model);
      // Send submitted data to backend
      this.http.post('/api/form-data/student-enrollment', this.model).subscribe();
    }
  }
}

//sample json
// [
//   { key: 'firstName', type: 'input', templateOptions: { label: 'First Name', required: true } },
//   { key: 'lastName', type: 'input', templateOptions: { label: 'Last Name', required: true } },
//   // ... more fields
//   ]//