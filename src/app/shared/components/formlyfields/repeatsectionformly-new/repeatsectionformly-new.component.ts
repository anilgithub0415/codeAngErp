/** src/app/shared/components/repeatsectionformly/repeatsectionformly.component.ts */
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyCustomRowBridgeNewComponent } from '../formly-custom-row-bridge-new/formly-custom-row-bridge-new.component';



interface FieldArrayHolder {
  fieldArray?: {
    fieldGroup?: any[];   // you can replace `any` with a stricter type if you wish
  };
}
type RepeatFieldConfig = FormlyFieldConfig & FieldArrayHolder;


@Component({
  selector: 'app-repeatsectionformly-new',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './repeatsectionformly-new.component.html',
  styleUrl: './repeatsectionformly-new.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class RepeatsectionformlyNewComponent extends FieldType {


  /** The whole Formly field config that contains this repeatsection */
 // @Input() field!: FormlyFieldConfig;

  /** The index of the current row – supplied by the rowFactory */
  @Input() rowIndex!: number;

  /** The parent FormGroup (provided by Formly) */
 // @Input() formGroup!: FormGroup;
  get fieldArray() {
    // `field` is supplied by FieldType; it may be undefined during construction,
    // so we guard with `?.`.
    return this.field?.fieldArray;
  }
  /** Cast the incoming Formly field to the extended type (for rows) */
  private get repeatField(): RepeatFieldConfig {
    return this.field as RepeatFieldConfig;
  }

  /** Shortcut to the array of row definitions */
  get rows(): any[] {
    return this.repeatField.fieldArray?.fieldGroup ?? [];
  }

  /** Expose a FormGroup‑typed getter for the template */
  get formGroup(): FormGroup {
    // `this.form` is FormGroup | FormArray.
    // If you are absolutely sure the control is a FormArray you can
    // return a new empty FormGroup as a fallback, but usually the cast
    // is enough because the template does not call FormGroup‑only methods.
    return this.form as FormGroup;
  }

  /** Factory that returns the bridge component for a given row index */
  rowBuilder(rowIdx: number) {
    return FormlyCustomRowBridgeNewComponent;
  }
}