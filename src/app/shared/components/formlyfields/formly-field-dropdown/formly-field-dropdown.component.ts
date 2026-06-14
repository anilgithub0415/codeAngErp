import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { LookupService } from '../../../../core/services/lookup.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-formly-field-dropdown',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,DropdownModule,SelectModule],
  templateUrl: './formly-field-dropdown.component.html',
  styleUrl: './formly-field-dropdown.component.scss'
})
export class FormlyFieldDropdownComponent extends FieldType {
private lookupService = inject(LookupService);

  ngOnInit(): void {
    const to = this.to as any;

      to.options$ = this.lookupService.searchLookup('roleTypes', 4, '')
       .pipe(
          map((options:any) => options.map((o:any) => ({ ...o,
      //label:o.label ?? o.name   // copy existing label to the expected property
    })))
  )
    }
 onDropdownChange(value: any) {
  console.log('onDropdownChg value:',value);
  
    // Explicitly update the Formly controller to forcefully update the model key
    this.formControl.setValue(value, { emitEvent: true });
    this.formControl.markAsDirty();
  }
    get optionLabel(): string {
    const to = this.to as any; 
    

    return to.optionLabel ?? 'label';
  }
}
