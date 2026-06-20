import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-custom-label-text',
  imports: [CommonModule,FormlyModule],
  templateUrl: './custom-label-text.component.html',
  styleUrl: './custom-label-text.component.scss'
})
export class CustomLabelTextComponent extends FieldType<FieldTypeConfig> {

}
