import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { CommonModule } from '@angular/common';
interface FieldOptions {
 label: string | TemplateRef<any>;
  addText?: string;
  [key: string]: any;  // Still allow other properties
}

@Component({
  selector: 'app-repeat-formly-section',
  standalone: true,
  imports: [CommonModule, PanelModule, ButtonModule, FormlyInputModule],
  templateUrl: './repeat-formly-section.component.html',
  styleUrls: ['./repeat-formly-section.component.scss']
})


export class RepeatFormlySectionComponent extends FieldArrayType{
  @Input() header!: string | TemplateRef<any>;
  @Output() onClick = new EventEmitter<void>();
  /**
   * Typed accessor for the Formly template options.
   */
  get fieldOptions(): FieldOptions {
    return this.to as unknown as FieldOptions;
  }

  /**
   * Returns the custom add button text defined in the Formly template options.
   * Falls back to the default 'Add' if not provided.
   */
  get addText(): string {
    return this.fieldOptions.addText || 'Add';
  }
  
  /**
   * Called from the template button to add a new item to the Formly field array.
   * Uses the `add()` method provided by `FieldArrayType`.
   */
  addItem(): void {
  console.log('addItem called', {
    field: this.field,
    fieldGroup: this.field?.fieldGroup,
    model: this.model,
    key: this.key
  });

  // Ensure the parent model path exists (e.g. `parent.model.organisations = []`) so
  // Formly's `add()` inserts an object on the first click instead of `undefined`.
  try {
    const key = this.field?.key;
    const parent = this.field?.parent as any;
    if (parent && key != null) {
      let pathArr: Array<string | number>;
      if (Array.isArray(key)) {
        pathArr = key;
      } else if (typeof key === 'string') {
        const normalized = key.replace(/\[(\w+)\]/g, '.$1');
        pathArr = normalized.split('.');
      } else {
        pathArr = [String(key)];
      }

      parent.model = parent.model || {};
      let modelRef = parent.model;
      for (let i = 0; i < pathArr.length - 1; i++) {
        const p: any = pathArr[i];
        if (modelRef[p] == null) {
          modelRef[p] = {};
        }
        modelRef = modelRef[p];
      }
      const last = pathArr[pathArr.length - 1] as any;
      if (!Array.isArray(modelRef[last])) {
        modelRef[last] = [];
      }
    }
  } catch (e) {
    // ignore initialization errors — Formly will still try to initialize
  }

  // Insert an initial empty object so controls bind to an object (not `undefined`).
  this.add(undefined, {});

  // Log after microtask so we see the updated model state.
  Promise.resolve().then(() => console.log('after add', { model: this.model, parentModel: this.field?.parent?.model }));
}
  
  /**
   * Return the value as a `TemplateRef` when it looks like one, otherwise `null`.
   * This guards template usage in the HTML where `field.template` can be a string.
   */
  getTemplateRef(value: any): TemplateRef<any> | null {
    if (!value) {
      return null;
    }
    // TemplateRef instances provide `createEmbeddedView` at runtime.
    if (value.createEmbeddedView && typeof value.createEmbeddedView === 'function') {
      return value as TemplateRef<any>;
    }
    return null;
  }

}
