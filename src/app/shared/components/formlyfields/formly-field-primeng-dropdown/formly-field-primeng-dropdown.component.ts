import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { LookupService } from '../../../../core/services/lookup.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Select, SelectModule } from 'primeng/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-formly-field-primeng-dropdown',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, DropdownModule, SelectModule, ReactiveFormsModule],
  templateUrl: './formly-field-primeng-dropdown.component.html',
  styleUrl: './formly-field-primeng-dropdown.component.scss'
})
export class FormlyFieldPrimengDropdownComponent extends FieldType<FieldTypeConfig> implements OnInit, OnDestroy {
  @ViewChild('primeSelect') primeSelect!: Select;
  
  private destroy$ = new Subject<void>(); 
  private resolvedAsyncOptions: any[] = [];

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    super();
  }

  lookupService = inject(LookupService);
  authService = inject(AuthService);

  get resolvedOptions(): any[] {
    const controlWithOpts = this.formControl as any;
    if (controlWithOpts?.customOptions && Array.isArray(controlWithOpts.customOptions)) {
      return controlWithOpts.customOptions;
    }
    if (this.to?.options && Array.isArray(this.to.options)) {
      return this.to.options;
    }
    return this.resolvedAsyncOptions;
  }
 
  ngOnInit() {
    const to = this.to as any;

    if (!to.options && !to.options$ && to.lookupKey) {
      const ptenantId = to.ptenantId ?? to.tenantId ?? this.authService?.getTenantId?.() ?? null;
      to.options$ = this.lookupService.searchLookup(to.lookupKey, ptenantId, '');
    }

    if (to.options$) {
      to.options$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        this.resolvedAsyncOptions = res ?? [];
        this.cdr.markForCheck();
      });
    }

    // ❌ REMOVED: f.formControl.valueChanges subscription block.
    // Removing this completely eliminates the asynchronous 100ms rendering loop that causes the visual flickering!
  }

  onManualUISelection(event: any) { 
    console.log('User manually selected item:', event.value);
  
    this.ngZone.run(() => {
      const selectedValue = event.value;

      if (this.formControl) {
        this.formControl.setValue(selectedValue, { emitEvent: true });
        this.formControl.markAsDirty();
        this.formControl.markAsTouched();
      }

      // Sync Formly backing layout model instance safely
      if (this.model && this.key) {
        this.model[this.key as string] = selectedValue;
      }

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
