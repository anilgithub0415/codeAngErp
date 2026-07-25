import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { ButtonModule } from 'primeng/button';
import { FormOpMode } from '../../../../../shared/enums/FormOpMode.enum';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormlyModule, ButtonModule],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss'
})
export class CustomerFormComponent {
  @Input() form!: FormGroup;
  @Input() fields: FormlyFieldConfig[] = [];
  @Input() model: any;
  @Input() currOpMode!: FormOpMode;
  @Input() isFormHidden: boolean = true;

  @Output() save = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
