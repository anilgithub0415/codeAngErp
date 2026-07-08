import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DatePickerModule } from 'primeng/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formly-field-primeng-datepicker',
  imports: [CommonModule, ReactiveFormsModule, DatePickerModule],
  templateUrl: './formly-field-primeng-datepicker.component.html',
  styleUrl: './formly-field-primeng-datepicker.component.scss'
})
export class FormlyFieldPrimengDatepickerComponent extends FieldType<FieldTypeConfig>{

}
