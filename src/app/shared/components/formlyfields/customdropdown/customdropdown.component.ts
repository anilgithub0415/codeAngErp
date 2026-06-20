
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject,ChangeDetectorRef, ViewChild } from '@angular/core';

import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { LookupService } from '../../../../core/services/lookup.service';
import { map } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { FormDropdownService } from '../form-dropdown.service';

@Component({
  selector: 'app-customdropdown',schemas:[CUSTOM_ELEMENTS_SCHEMA],standalone:true,
  imports: [CommonModule,DropdownModule,SelectModule,FormlyModule],
  templateUrl: './customdropdown.component.html',
  styleUrl: './customdropdown.component.scss'
})
export class CustomdropdownComponent extends FieldType<FieldTypeConfig> {
 private valueChangesSub!: Subscription;
  
  // 1. Maintain a local copy of options to eliminate PrimeNG reference lag
  localOptions: any= [];

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    // Populate options from your JSON config right away so PrimeNG knows they exist
    this.localOptions = this.props['options'] || [];

    if (this.field && this.field.formControl) {
      
      // 2. Safely intercept programmatic button actions like control.setValue('B2BC')
      this.valueChangesSub = this.field.formControl.valueChanges.subscribe((latestValue: string) => {
        console.log('Value successfully received inside subscription block:', latestValue);

        // Update the underlying model tree 
        if (this.model && this.key) {
          this.model[this.key as string] = latestValue;
        }

        // 3. FORCE PRIMENG 19 REPAINT: Delay by an instantaneous microtask cycle
        // This gives PrimeNG's DOM engine 10 milliseconds to match your value to its options array
        setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges(); 
        }, 10);
      });
    }
  }

  // Captures human selection clicks from the dropdown overlay list panel cleanly
  onUserDropdownClick(eventvalue: any) {
    const selectedVal = eventvalue;

    if (this.formControl) {
      this.formControl.setValue(selectedVal, { emitEvent: false }); // Prevents circular infinite execution loops
      this.formControl.markAsDirty();
      this.formControl.markAsTouched();
    }

    if (this.model && this.key) {
      this.model[this.key as string] = selectedVal;
    }

    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    if (this.valueChangesSub) {
      this.valueChangesSub.unsubscribe();
    }
  }
}