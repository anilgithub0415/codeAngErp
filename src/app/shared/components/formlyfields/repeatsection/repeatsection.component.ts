import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';

import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-repeatsection',
  imports: [CommonModule, PanelModule, ButtonModule, FormlyInputModule, FormlyModule, FormsModule,ReactiveFormsModule,
    PanelModule, TableModule],
  templateUrl: './repeatsection.component.html',
  styleUrl: './repeatsection.component.scss'
})
export class RepeatsectionComponent extends FieldArrayType{

}
