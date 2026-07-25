import {  ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';

import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule,  ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-repeatsectionformly',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, PanelModule, ButtonModule, FormlyInputModule, FormlyModule, FormsModule,ReactiveFormsModule,
    PanelModule, TableModule
  ],
  templateUrl: './repeatsectionformly.component.html',
  styleUrl: './repeatsectionformly.component.scss',
  
})
export class RepeatsectionformlyComponent extends FieldArrayType{
  
  constructor(private cdr:ChangeDetectorRef){
    super();
  }


  addNewItem(): void { 
    // 1. Get default data object
    const defaultData = this.getDefaultMethod(); // { quantity: 500 }
    
    // 2. Deep copy to break any shared object references
    const newItem = JSON.parse(JSON.stringify(defaultData));
    
    // 3. CRITICAL FOR FORMLY: Call Formly's native array insertion method.
    // This automatically spawns the underlying FormControls and adds them to field.fieldGroup.
    this.add(undefined, newItem);
    
    // 4. Force UI thread to redraw Formly fields instantly
    this.cdr.detectChanges(); 
  }

  private getDefaultMethod() {
    // If you configured rowDefaults in your Formly config JSON, use it. Fallback to hardcoded object.
    return this.props?.['rowDefaults'] || { };
  }
}
// 