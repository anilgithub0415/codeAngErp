import { Component ,CUSTOM_ELEMENTS_SCHEMA,Input} from "@angular/core";
import { RegistryFieldConfig } from "../../../../feature/customer-mgt/formly-registry";
import { FormsModule, ReactiveFormsModule, FormGroup } from "@angular/forms";
import { FieldType } from "@ngx-formly/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-formly-custom-row-bridge-new',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports:[ReactiveFormsModule,FormsModule,CommonModule], standalone:true,
  template: `
    <formly-field
      *ngFor="let field of rowConfig.fieldGroup"
      [field]="field"
      [model]="model"
      [form]="form">
    </formly-field>
  `
})
export class FormlyCustomRowBridgeNewComponent extends FieldType {
    /** The custom field that contains the factory */
  //@Input() field!: RegistryFieldConfig;

  /** The index of the row – supplied by the repeat‑section component */
  @Input() rowIndex!: number;/** The concrete row configuration that the repeat‑section generated
   *  (it contains a `fieldGroup` array of the fields for this row). */
  @Input() rowConfig!: RegistryFieldConfig;



  
  ngOnInit(): void { console.log('ngOnInit of rowbridge');
  
    if ((this.field as RegistryFieldConfig).getRowConfig) {
      // **THIS CALLS your rowFactory** (the function you assigned earlier)
      this.rowConfig = (this.field as RegistryFieldConfig).getRowConfig!(this.rowIndex);
    } else {
      console.warn('No getRowConfig on field', this.field);
    }
  }
}
// import { FormlyFieldConfig } from '@ngx-formly/core';
// import { organisationRowTemplate } from '../organisation-row/organisation-row.template';

// export function organisationRow(index: number): FormlyFieldConfig {
//   // Clone the raw template (the JSON you posted in the question)
//   const template = organisationRowTemplate as any;

//   // -----------------------------------------------------------------
//   // 1️⃣ Replace `${index}` placeholder in the key
//   // -----------------------------------------------------------------
//   if (typeof template.key === 'string') {
//     template.key = template.key.replace('${index}', `${index}`);
//   }

//   // -----------------------------------------------------------------
//   // 2️⃣ Make the boolean flag (`customerDetailsRequired`) available
//   // -----------------------------------------------------------------
//   // The flag lives on the *organisation* object model.
//   // We copy an empty model so the flag is present on each row.
//   template.model = {};

//   // -----------------------------------------------------------------
//   // 3️⃣ Replace the sentinel "REMOVE_ROW" with a real click handler
//   // -----------------------------------------------------------------
//   const replaceSentinel = (field: any) => {
//     if (field.props?.onClick === 'REMOVE_ROW') {
//       field.props.onClick = (_event: any, fld: any) => {
//         // `fld.parent` is the repeat container (the organisations array)
//         const arr = fld.parent.model.organisations as any[];
//         arr.splice(index, 1);
//       };
//     }

//     // Recursively walk nested groups (e.g. fieldGroup inside a row)
//     if (field.fieldGroup) {
//       field.fieldGroup.forEach(replaceSentinel);
//     }
//   };

//   replaceSentinel(template);

//   // -----------------------------------------------------------------
//   // 4️⃣ Return a FormlyFieldConfig that can be rendered
//   // -----------------------------------------------------------------
//   return template as FormlyFieldConfig;
// }