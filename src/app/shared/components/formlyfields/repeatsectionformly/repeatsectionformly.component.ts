import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';

import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-repeatsectionformly',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, PanelModule, ButtonModule, FormlyInputModule, FormlyModule, FormsModule,ReactiveFormsModule,
    PanelModule, TableModule
  ],
  templateUrl: './repeatsectionformly.component.html',
  styleUrl: './repeatsectionformly.component.scss'
})
export class RepeatsectionformlyComponent extends FieldArrayType{

}
// 