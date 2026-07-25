import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-field-button',
  imports: [],
  templateUrl: './formly-field-button.component.html',
  styleUrl: './formly-field-button.component.scss'
})
export class FormlyFieldButtonComponent extends FieldType<FieldTypeConfig> {}

