
import { Subject } from 'rxjs';


import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';




import { SelectModule } from 'primeng/select';

//import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldDropdownComponent} from '../../../shared/components/formlyfields/formly-field-dropdown/formly-field-dropdown.component';

import { PanelModule } from 'primeng/panel';
import { FormlyInputModule } from '@ngx-formly/primeng/input';


import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { FormlyConfig, FormlyFieldConfig, FormlyModule, provideFormlyConfig, provideFormlyCore } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDropdownNewComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown-new/formly-field-primeng-dropdown-new.component';
import { EmitEvent } from '../../../core/services/event-bus.service';


import { CustomdropdownComponent } from '../../../shared/components/formlyfields/customdropdown/customdropdown.component';
import { FormDropdownService } from '../../../shared/components/formlyfields/form-dropdown.service';
import { provideRouter } from '@angular/router';
@Component({
  selector: 'app-my-feature',
  imports: [CommonModule,ReactiveFormsModule, FormlyModule, FormsModule,SelectModule,FormlyModule,
        ButtonModule
        ,FormlyInputModule,PanelModule, TableModule,ButtonModule,RippleModule, DropdownModule, SelectModule],
  templateUrl: './my-feature.component.html',
  styleUrl: './my-feature.component.scss',
  // providers:[
  //    provideFormlyCore({
  //   //FormlyModule.forChild({
  //    types:[     { name: 'customdropdown', component: CustomdropdownComponent },   ]
  //   //})
  //   })
  // ]
})
export class MyFeatureComponent implements OnInit{
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  private categoryTrigger$ = new Subject<string>();

private dropdownService=inject(FormDropdownService)

  ngOnInit() {
 this.fields = [{key:'nm',type:'input',props:{label:'enter nm:'}},
      {
         key: 'customerCategory',
        type: "customlabeltext",
        className: 'col-span-2 md:col-span-2',
        props: {   
          label: 'Category',
          optionLabel: 'label',
           optionValue: 'value',
          placeholder: 'Select Category',
          filter: true,

           valueTriggerStream: this.categoryTrigger$,
          
          options: [
            { "label": "B2B", "value": "B2B" },
            { "label": "B2BC", "value": "B2BC" },
            { "label": "B2C", "value": "B2C" },
            { "label": "Dealer", "value": "Dealer" },
            { "label": "OEM", "value": "OEM" },
            { "label": "Wholesaler", "value": "Wholesaler" }
          ]
        }
        }
      ]
  }

  // 3. Clear action button logic 
  onEditButtonClick() {
  // 1. Maintain form data object submission payload graph integrity
  this.model.customerCategory = 'B2BC';

  // 2. Locate the active live formly layout descriptor field
  const categoryFieldInstance = this.fields.find(item => item.key === 'customerCategory');

  if (categoryFieldInstance && categoryFieldInstance.formControl) {
    // 3. Fire the update. This alerts our valueChanges hook inside the custom dropdown component instantly!
    categoryFieldInstance.formControl.setValue('B2BC', { emitEvent: true });
  } else {
    // Fallback if form structure layout initialization hasn't finished parsing
    (this.form.get('customerCategory') as any)?.setValue('B2BC', { emitEvent: true });
  }
}





onSubmit(){

}

}