import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { LookupService } from '../../../../core/services/lookup.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SelectModule } from 'primeng/select';
import { delay, map, of } from 'rxjs';

@Component({
  selector: 'app-formly-field-primeng-dropdown',standalone:true,
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,DropdownModule,SelectModule],
  templateUrl: './formly-field-primeng-dropdown.component.html',
  styleUrl: './formly-field-primeng-dropdown.component.scss'
})
export class FormlyFieldPrimengDropdownComponent extends FieldType<FormlyFieldConfig>{
   //@ViewChild('primeDropdown', { static: false }) primeDropdown!: Dropdown;

   myStaticOptions: any[] = []; // Natively managed array
  private _primeDropdown!: Dropdown;

  // This setter fires dynamically as soon as *ngIf evaluates to true and creates the element
  // @ViewChild('primeDropdown', { static: false }) set primeDropdown(component: Dropdown) {
  //   if (component) {
  //     this._primeDropdown = component;
  //     console.log('its primedrodown.......... SUCCESSFULLY FOUND!');
      
  //     // Execute the selection injection immediately now that the element exists
  //     this.applyPreselectedSelection();
  //   }
  // }
 private lookupService = inject(LookupService);
  private authService = inject(AuthService);

constructor(private cd: ChangeDetectorRef) { super();}
  ngOnInit(): void {
    const to = this.to as any;

    // If the field only supplies a lookupKey, create an options$ observable
      //if(localStorage.getItem('currOpMode')){var mode=localStorage.getItem('currOpMode')?.toString();}
      //if(mode !=="UPDATE" ){

    if (!to.options && !to.options$ && to.lookupKey) {
      const ptenantId =
        to.ptenantId ?? to.tenantId ?? this.authService?.getTenantId?.() ?? null;
       to.options$ = this.lookupService.searchLookup(to.lookupKey, ptenantId, '')
    }

    // When options are provided directly via Formly props, store them in myStaticOptions
    if (to.options && Array.isArray(to.options)) {
      this.myStaticOptions = to.options;
    }
     
  //     // ---- DEBUG ----
  //   //to.options$?.subscribe((opts:any) => console.log('OPTIONS EMITTED:', opts));
  //   // ---------------

  //     .pipe(
  //   map(options => options.map(o => ({ 
    
  //     ...o,
  //     //label:o.label ?? o.name   // copy existing label to the expected property
  //   })))
  // );;

  //setTimeout(() => {
   // console.log('static options filling........');
    
   //static options
      // to.options$ = 
//        of([
//     { "label": "B2B", "value": "B2B" },
//     { "label": "B2BC", "value": "B2BC" },
//     { "label": "B2C", "value": "B2C" },
//     { "label": "Dealer", "value": "Dealer" },
//     { "label": "OEM", "value": "OEM" },
//     { "label": "Wholesaler", "value": "Wholesaler" }
//   ]).pipe(delay(0));
// //map((options:any) => options.map((opt:any) => ({ label: opt.label, value: opt.value })))
// //map((options:any) => options.map((opt:any) => opt.value)) 
//   map((options:any) => {
//       // Force conversion to a clean PrimeNG SelectItem architecture
//       return options.map((opt:any) => ({ label: opt.label, value: opt.value }));
//     })

// of([
//       { "label": "B2B", "value": "B2B" },
//       { "label": "B2BC", "value": "B2BC" },
//       { "label": "B2C", "value": "B2C" },
//       { "label": "Dealer", "value": "Dealer" }
//     ]).pipe(
//       delay(10)
//     ).subscribe((data:any) => { console.log('its subscribe of of[]');
    
//       // 1. Assign options cleanly to a static variable
//       this.myStaticOptions = data.map((opt:any) => ({ label: opt.label, value: opt.value }));
//        if (this._primeDropdown && this.formControl && this.formControl.value) {console.log('pdropdown frmcntr its value');
//        }
    

//                this.cd.detectChanges();
  //       }
  //     }, 50);
    
  


//}
   // )

  }

//}

//}
applyPreselectedSelection() { console.log('this is applyPreselectedSelection.....');

    if (this._primeDropdown && this.formControl && this.formControl.value) {
      // Prefer static options loaded by the component; fall back to the options passed via Formly props.
      const staticOpts = this.myStaticOptions && this.myStaticOptions.length ? this.myStaticOptions : (this.to as any).options || [];
      const matchedOption = staticOpts.find((o: any) => o.value === this.formControl.value);
      if (matchedOption) {
        console.log('matchedOption:', matchedOption);
        // Direct assignment to PrimeNG 7's public value handler property
        (this._primeDropdown as any).selectedOption = matchedOption;
        // Update PrimeNG internal state so the label is shown
        if (typeof (this._primeDropdown as any).updateFilledState === 'function') {
          (this._primeDropdown as any).updateFilledState();
        }
        this.cd.detectChanges();
      }
    }
  }
  

 onDropdownChange(event: any) {
    
    // Explicitly update the Formly controller to forcefully update the model key
    this.formControl.setValue(event.value, { emitEvent: true });
    this.formControl.markAsDirty();

  
  }
 get optionLabel_notinuse(): string {
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
