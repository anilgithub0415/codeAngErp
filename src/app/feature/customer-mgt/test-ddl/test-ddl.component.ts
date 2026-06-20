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
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDropdownNewComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown-new/formly-field-primeng-dropdown-new.component';
import { EmitEvent } from '../../../core/services/event-bus.service';

@Component({
  selector: 'app-test-ddl', standalone:true, schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,ReactiveFormsModule, FormlyModule, FormsModule,SelectModule,FormlyModule,
      ButtonModule
      ,FormlyInputModule,PanelModule, TableModule,ButtonModule,RippleModule, DropdownModule, SelectModule],
  templateUrl: './test-ddl.component.html',
  styleUrl: './test-ddl.component.scss'
})
export class TestDDLComponent {
    form = new FormGroup({});
    model={nm:'',customerCategory:'B2B',myNumberDropdown:'one'}
 fields: FormlyFieldConfig[]=[];
 // 1. Initialize formState dictionary object
  formState = {
    selectedCategory: ''
  };
     private formlyConfig = inject(FormlyConfig);
    
     constructor(private cd:ChangeDetectorRef){}

ngOnInit(){  
  localStorage.setItem('currOpMode',"UPDATE")

 //this.formlyConfig.setType({     name: 'primeng-dropdown',     component: FormlyFieldPrimengDropdownNewComponent,   });
 
   this.fields= [{
    key:'nm',type:'input',
  },
  {  "type": FormlyFieldPrimengDropdownNewComponent,
       "key": "customerCategory",   "className": "col-span-2 md:col-span-2",
       "props": {   
          "label": "Category",//"lookupKey":"customerCategoryTypes",
          "optionLabel": "label",
          "optionValue": "value",
          "placeholder": "Select Category",
          // Provide static options for the demo; replace with lookupKey in production
          "options": [
            { "label": "B2B", "value": "B2B" },
            { "label": "B2BC", "value": "B2BC" },
            { "label": "B2C", "value": "B2C" },
            { "label": "Dealer", "value": "Dealer" },
            { "label": "OEMxyz", "value": "OEMxyz" },
            { "label": "Wholesaler", "value": "Wholesaler" }
          ],
          "required": true,
          "filter": true
       },
        "expressions": {
    "formControl.value": "formState.selectedCategory"
  }

    },
  
  {
    key: 'myNumberDropdown',
    type: 'select', // Uses Formly built‑in select wrapper
    props: {
      label: 'Number Selection',
      placeholder: 'Select a number',
      optionLabel: 'label',
      optionValue: 'value',
      options: [
        { label: 'One', value: 'one' },
        { label: 'Two', value: 'two' },
        { label: 'Three', value: 'three' }
      ]
    },
    // Formly constantly evaluates this block automatically
    expressions: {
      'model.customerCategory': (field) => {
        // If the 'nm' field equals 'trigger', automatically select 'B2BC'
        if (field.model?.nm === 'trigger') {
          return 'B2BC';
        }
        // Otherwise, keep whatever value it currently has
        return field.model?.customerCategory;
      }
    }
  }
];

    }

    onEditButtonClick() {
  // 1. Locate the live active field layout descriptor from your initialized fields list
  const categoryFieldInstance = this.fields.find(fieldItem => fieldItem.key === 'customerCategory');

  if (categoryFieldInstance && categoryFieldInstance.formControl) {
    // 2. Set the value directly on the live instance to trigger the custom component valueChanges hook
    categoryFieldInstance.formControl.setValue('B2BC', { emitEvent: true });
  } else {
    // 3. Fallback: If Formly is rebuilding structural templates, update the control tree via form reference
    const fallbackControl = this.form.get('customerCategory') as any;
    if (fallbackControl) {
      fallbackControl.setValue('B2BC', { emitEvent: true });
    }
  }
}





//      onEditButtonClick() {
//   // 1. Fetch your model row details or API data
//   const targetCategoryValue = 'Wholesaler'; 

//   // 2. Wrap the assignment in a setTimeout (No ngZone needed here)
//   setTimeout(() => {
//     // Cast the retrieved control to a specific FormControl type
// const control = this.form.get('customerCategory') as any;//FormControl<string | null>

// if (control) {
//   control.setValue(targetCategoryValue, { emitEvent: true });
//   control.markAsDirty();
//   control.markAsTouched();
// }
//   });
// }



    workit(){
      // Populate model with values matching the defined options
      this.model = { nm: 'its 2', customerCategory: 'B2B', myNumberDropdown: 'two' };
      // Set static fields first (nm and myNumberDropdown)
      this.form.setValue({ nm: this.model.nm, myNumberDropdown: this.model.myNumberDropdown });
      // The primeng dropdown loads its options asynchronously via lookupKey.
      // Defer setting its value until the next JavaScript tick so the options are available.
      setTimeout(() => {
        (this.form.get('customerCategory') as any)?.setValue(this.model.customerCategory);
        this.form.updateValueAndValidity();
        this.cd.detectChanges();
      });
    }
onSubmit(){}

}