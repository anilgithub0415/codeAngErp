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
import { SelectModule } from 'primeng/select';
import { delay, map, of, Subscription } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-formly-field-primeng-dropdown-new',
  standalone:true,
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,DropdownModule,SelectModule],
  templateUrl: './formly-field-primeng-dropdown-new.component.html',
  styleUrl: './formly-field-primeng-dropdown-new.component.scss',
  providers:[{
    provide:NG_VALUE_ACCESSOR,
    useExisting: forwardRef(()=>FormlyFieldPrimengDropdownNewComponent),
    multi:true
  }]
})
export class FormlyFieldPrimengDropdownNewComponent extends FieldType<FieldTypeConfig> implements OnInit, OnDestroy
//implements ControlValueAccessor

{
   private formlyControlSubscription!: Subscription;

  

 constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    super();
  }
selectedValue: string = '';

lookupService=inject(LookupService)
authService=inject(AuthService)
 myStaticOptions: any[] = []; 
  ngOnInit(): void {
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

    if (this.formControl) {
      // Direct listener for programmatic actions: formControl.setValue('B2BC')
      this.formlyControlSubscription = this.formControl.valueChanges.subscribe((externalValue) => {
        this.ngZone.run(() => {
          // 1. Manually update Formly's root data object model representation tree
          if (this.model && this.key) {
            this.model[this.key as string] = externalValue;
          }
        })
      })
    }
  
          
  }

  // Captures structural mouse click operations natively from PrimeNG's UI panel view
  onManualUISelection(event: any) {
    this.ngZone.run(() => {
      const selectedValueString = event.value;

      // 1. Synchronize the underlying Angular form control state
      if (this.formControl) {
        this.formControl.setValue(selectedValueString, { emitEvent: false });
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
      }

      // 2. Synchronize Formly's internal model dictionary tree
      if (this.model && this.key) {
        this.model[this.key as string] = selectedValueString;
      }

      this.cdr.markForCheck();
    });
  }


  // Custom Dropdown Class Method
onManualSelection(event: any) {
  if (this.formControl && this.model && this.key) {
    this.formControl.setValue(event.value, { emitEvent: true });
    this.model[this.key as string] = event.value;
  }
}

   onManualUISelect(event: any) {
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

 ngOnDestroy() {
    if (this.formlyControlSubscription) {
      this.formlyControlSubscription.unsubscribe();
    }
  }
  // Angular calls this when you execute .setValue('B2BC')
  writeValue(value: any): void {
    if (value) { console.log('writevalue is running now...........');
    
      this.selectedValue = value; 
    }
  }

  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}

 

}
