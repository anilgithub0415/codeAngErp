import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { ButtonModule } from 'primeng/button';
import { NgxPermissionsModule } from 'ngx-permissions';
import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { IClientRFQWorkflow } from '../../../../core/models/clientRFQ.model';

@Component({
  selector: 'app-client-rfq-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    FormlyPrimeNGModule, ButtonModule, NgxPermissionsModule
  ],
  templateUrl: './client-rfq-form.component.html',
  styleUrl: './client-rfq-form.component.scss'
})
export class ClientRFQFormComponent {
  @Input() form!: FormGroup;
  @Input() fields: FormlyFieldConfig[] = [];
  @Input() model: any;
  @Input() currOpMode!: FormOpMode;
@Input() workflow!: IClientRFQWorkflow;
  @Output() saveDraft = new EventEmitter<void>();
  @Output() submitForApproval = new EventEmitter<void>();
  @Output() clearForm = new EventEmitter<void>();
  @Output() approve = new EventEmitter<void>();
  @Output() send = new EventEmitter<void>();
  @Output() convertToQuote=new EventEmitter<any>();
  @Output() reject = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();


    
}
