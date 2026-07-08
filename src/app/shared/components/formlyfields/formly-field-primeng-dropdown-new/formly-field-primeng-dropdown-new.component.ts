//import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
//iport { FieldType } from '@ngx-formly/core';
//import { LookupService } from '../../../../core/services/lookup.service';
//import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef, inject, NgZone, NgZoneOptions, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { LookupService } from '../../../../core/services/lookup.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Select, SelectModule } from 'primeng/select';
import { delay, map, of, Subscription } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-formly-field-primeng-dropdown-new',
  standalone:true,
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,DropdownModule,SelectModule],
  templateUrl: './formly-field-primeng-dropdown-new.component.html',
  styleUrl: './formly-field-primeng-dropdown-new.component.scss',
 host: {
    'class': 'block w-full',
    'style': 'display: block; width: 100%;'
  }
})
export class FormlyFieldPrimengDropdownNewComponent extends FieldType<FieldTypeConfig> //implements OnInit
//implements ControlValueAccessor

{
   isPropagating:boolean=false; 
  @ViewChild('primeSelect') primeSelect!: Select;

myoptions:any[]=[
            { "label": "B2B", "value": "B2B" },
            { "label": "B2BC", "value": "B2BC" },
            { "label": "B2C", "value": "B2C" },
            { "label": "Dealer", "value": "Dealer" },
            { "label": "OEM", "value": "OEM" },
            { "label": "Wholesaler", "value": "Wholesaler" }
          ]
  

 constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    super();
  }
//selectedValue: string = '';

// lookupService=inject(LookupService)
// authService=inject(AuthService)
 
 
 ngOnInit() {
    if (this.formControl) {
      this.formControl.valueChanges.subscribe((newValue) => {
        console.log('value changes .........', newValue);
        
        setTimeout(() => {
          if (this.primeSelect) {
            // Force PrimeNG to process the value manually 
            this.primeSelect.updateModel(newValue); 
          }
          this.cdr.markForCheck();
        }, 100);
      });
    }
  }
  //ngOnInit() 
//  {
//     if (this.formControl) {
//       this.formControl.valueChanges.subscribe(() => { console.log('value changes .........');
      
//         // Yield execution thread temporarily so PrimeNG can map option configurations safely
//         setTimeout(() => {
//           this.cdr.markForCheck();
//         }, 100);
//       });
//     }
//   }

 //  ngOnInit(): void {
    //  if (this.formControl) {
    //   // Listen explicitly to external reactive model changes
    //   // 1. Instantly listen to any manual UI updates or programmatic setValue changes
    //   this.statusSubscription = this.formControl.valueChanges.subscribe((newValue) => {
        
    //     // 2. Force synchronization into Formly's internal model tree manually
    //     if (this.field && this.model) {
    //       this.model[this.key as string] = newValue;
    //     }

    //     // 3. Command the UI view layer to paint immediately
    //     this.cdr.markForCheck();
    //     this.cdr.detectChanges();
    //   });
    // }
    //  const to = this.to as any;
    // this.to['options']=[
    //         { "label": "B2B", "value": "B2B" },
    //         { "label": "B2BC", "value": "B2BC" },
    //         { "label": "B2C", "value": "B2C" },
    //         { "label": "Dealer", "value": "Dealer" },
    //         { "label": "OEM", "value": "OEM" },
    //         { "label": "Wholesaler", "value": "Wholesaler" }
    //       ]
    // const to = this.to as any;

    // // If the field only supplies a lookupKey, create an options$ observable
    //   //if(localStorage.getItem('currOpMode')){var mode=localStorage.getItem('currOpMode')?.toString();}
    //   //if(mode !=="UPDATE" ){

    // if (!to.options && !to.options$ && to.lookupKey) {
    //   const ptenantId =
    //     to.ptenantId ?? to.tenantId ?? this.authService?.getTenantId?.() ?? null;
    //    to.options$ = this.lookupService.searchLookup(to.lookupKey, ptenantId, '')
    // }

    //  if (to.options && Array.isArray(to.options)) {
    //   this.myStaticOptions = to.options;
    // }

    
  
          
  //} end of ngOnInit

  // Captures structural mouse click operations natively from PrimeNG's UI panel view
//   onManualUISelection(event: any) { console.log('its running onManualselection');
  
//     this.ngZone.run(() => {
//       const selectedValueString = event.value;
// console.log('selectedValueString need to set in model:',selectedValueString);

//       // 1. Synchronize the underlying Angular form control state
//       if (this.formControl) {
//         this.formControl.setValue(selectedValueString, { emitEvent: false });
//         this.formControl.markAsDirty();
//         this.formControl.markAsTouched();
//       }

//       // 2. Synchronize Formly's internal model dictionary tree
//       if (this.model && this.key) {
//         this.model[this.key as string] = selectedValueString;
//       }

//       this.cdr.markForCheck();
//     });
//   }
onManualUISelection(event: any) { 
  console.log('its running onManualselection');

  const selectedValueString = event.value;

  // 🌟 BREAK THE LOOP: If the UI selection matches what's already in the form control, stop!
  if (this.formControl && this.formControl.value === selectedValueString) {
    return;
  }

  this.ngZone.run(() => {
    console.log('selectedValueString need to set in model:', selectedValueString);

    this.isPropagating = true; 

    if (this.formControl) {
      this.formControl.setValue(selectedValueString, { emitEvent: true });
      this.formControl.markAsDirty();
      this.formControl.markAsTouched();
    }

    if (this.model && this.key) {
      this.model[this.key as string] = selectedValueString;
    }

    this.isPropagating = false; 
    this.cdr.markForCheck();
  });
}


  // Custom Dropdown Class Method
onManualSelection_notinuse(event: any) {
  if (this.formControl && this.model && this.key) {
    this.formControl.setValue(event.value, { emitEvent: true });
    this.model[this.key as string] = event.value;
  }
}

   onManualUISelect_notinuse(event: any) {
    const selectedVal = event.value;

    if (this.formControl) {
      // 1. Update the reactive form control value state
      this.formControl.setValue(selectedVal, { emitEvent: true });
    }

    if (this.model && this.key) {
      // 2. Direct-map user input selections back into the global model object tree
      this.model[this.key as string] = selectedVal;
    }

    // 3. Inform view tree to repaint selection highlight text
    this.cdr.markForCheck();
  }

  
 // Captures UI clicks natively from PrimeNG's panel overlay
  onDropdownUIChange_notinuse(event: any) {
    this.ngZone.run(() => {
      const selectedValue = event.value;
      
      if (this.formControl) {
        this.formControl.setValue(selectedValue, { emitEvent: false });
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
      }

      if (this.model && this.key) {
        this.model[this.key as string] = selectedValue;
      }

      this.cdr.markForCheck();
    });
  }
  

    // Handle manual selection changes originating directly from PrimeNG's UI interaction panel
  onDropdownChange_notinuse(event: any) {
    if (this.formControl) {
      this.formControl.setValue(event.value, { emitEvent: true });
      this.formControl.markAsDirty();
      this.formControl.markAsTouched();
    }
  }
// Direct hook for user interaction: clicking on the dropdown options
  onSelectionChange_notinuse(e:any) {console.log('onSelectionChange running');
  
   var selectedValue=e.value; console.log('e.value:',e.value);
   
    this.ngZone.run(() => {
      if (this.formControl) {
        // 1. Force update the Angular reactive form control
        this.formControl.setValue(selectedValue, { emitEvent: false });
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
      }

      // 2. Force update Formly's model object tree 
      if (this.model && this.key) {
        this.model[this.key as string] = selectedValue;
      }

      this.cdr.markForCheck();
    });
  }

 
  // Angular calls this when you execute .setValue('B2BC')
  writeValue_notinuse(value: any): void {
    if (value) { console.log('writevalue is running now...........');
    
      //this.selectedValue = value; 
    }
  }

  registerOnChange_notinuse(fn: any): void {}
  registerOnTouched_notinuse(fn: any): void {}

 

}
