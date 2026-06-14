import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { LookupService } from '../../../../core/services/lookup.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SelectModule } from 'primeng/select';
import { map } from 'rxjs';

@Component({
  selector: 'app-formly-field-primeng-dropdown',standalone:true,
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,DropdownModule,SelectModule],
  templateUrl: './formly-field-primeng-dropdown.component.html',
  styleUrl: './formly-field-primeng-dropdown.component.scss'
})
export class FormlyFieldPrimengDropdownComponent extends FieldType<FormlyFieldConfig>{
 private lookupService = inject(LookupService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const to = this.to as any;

    // If the field only supplies a lookupKey, create an options$ observable
    if (!to.options && !to.options$ && to.lookupKey) {
      const ptenantId =
        to.ptenantId ?? to.tenantId ?? this.authService?.getTenantId?.() ?? null;
      to.options$ = this.lookupService.searchLookup(to.lookupKey, ptenantId, '')
      // ---- DEBUG ----
    //to.options$?.subscribe((opts:any) => console.log('OPTIONS EMITTED:', opts));
    // ---------------

      .pipe(
    map(options => options.map(o => ({
      ...o,
      //label:o.label ?? o.name   // copy existing label to the expected property
    })))
  );;

     
      
      
    }
  }

 onDropdownChange(event: any) {
    
    // Explicitly update the Formly controller to forcefully update the model key
    this.formControl.setValue(event.value, { emitEvent: true });
    this.formControl.markAsDirty();

  
  }
 get optionLabel(): string {
    const to = this.to as any; 
    

    return to.optionLabel ?? 'label';
  }
  get optionValue(): string {
    const to = this.to as any; 
    

    return to.optionValue ?? 'label';
  }
  
  // get optionLabel(): string { 
  //   console.log('yes getting optionlabel :',this.to['label']);
  //  // const to = this.to as any;
  //   return this.to['label']! ;
  // }

}
