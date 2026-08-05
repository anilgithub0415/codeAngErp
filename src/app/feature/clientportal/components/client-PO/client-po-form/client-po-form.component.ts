import { Component, OnInit, Input, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig, FormlyConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { ButtonModule } from 'primeng/button';
import { NgxPermissionsModule } from 'ngx-permissions';
import { FormOpMode } from '../../../../../shared/enums/FormOpMode.enum';
import { FormService } from '../../../../../core/services/form.service';
import { ProductService } from '../../../../../core/services/product.service';
import { PurchaseService, TenantRulesMatrixResponse } from '../../../../../core/services/purchase.service';
import { FormlyCardWrapperComponent } from '../../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component';
import { FormlyFieldPrimengDropdownComponent } from '../../../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyFieldPrimengDatepickerComponent } from '../../../../../shared/components/formlyfields/formly-field-primeng-datepicker/formly-field-primeng-datepicker.component';
import { RepeatsectionformlyComponent } from '../../../../../shared/components/formlyfields/repeatsectionformly/repeatsectionformly.component';
import { FormlyCustomRowBridgeComponent } from '../../../../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
import { bindDatabaseHooks, hydrateFormlyConfig } from '../../../../../shared/utils/hydrationOfFormlyJson';

@Component({
  selector: 'app-client-po-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, FormlyModule, 
    FormlyPrimeNGModule, ButtonModule, NgxPermissionsModule
  ],
  templateUrl: './client-po-form.component.html',
  styleUrl: './client-po-form.component.scss'
})
export class ClientPOFormComponent implements OnInit {
  @Input() model: any;
  @Input() currOpMode!: FormOpMode;
  @Input() tenantId!: number;

  @Output() onSaveWorkflow = new EventEmitter<{ model: any, shouldSubmit: boolean }>();
  @Output() onApprove = new EventEmitter<number>();
  @Output() onSend = new EventEmitter<number>();

  @Output() onReject = new EventEmitter<number>();
  @Output() onCancel = new EventEmitter<void>();
@Output() onConvertToSales = new EventEmitter<number>();

  form = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  raw: any;
  aForm!: any;

  private formlyConfig = inject(FormlyConfig);
  private formService = inject(FormService);
  private productService = inject(ProductService);
  private purchaseService = inject(PurchaseService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });
    this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
    this.formlyConfig.setType({ name: 'datepicker', component: FormlyFieldPrimengDatepickerComponent });
    this.formlyConfig.setType({ name: 'p-repeatsectionformly', component: RepeatsectionformlyComponent });
    this.formlyConfig.setType({ name: 'custom', component: FormlyCustomRowBridgeComponent });

    this.getForm_ClientPO();
  }

  getForm_ClientPO() {
    this.formService.getForm(this.tenantId!, 'clientpo_form').subscribe(aform => {
      this.aForm = aform;
      this.raw = JSON.parse(this.aForm.FormlyConfig);
      this.compileAndHydrateFields();
    });
  }

  private compileAndHydrateFields(): void {
    this.fields = hydrateFormlyConfig(this.raw);
    bindDatabaseHooks(this.productService, this.tenantId, this.fields);
    this.initializeFormBlueprint();
  }

  private initializeFormBlueprint(): void {
    this.fields = hydrateFormlyConfig(this.raw);
    const itemsSection = this.fields.find(f => f.key === 'items');

    if (itemsSection && itemsSection.fieldArray && typeof itemsSection.fieldArray === 'object') {
      const groupFields = itemsSection.fieldArray.fieldGroup || [];
      const uomField = groupFields.find(f => f.key === 'purchaseUom');

      if (uomField) {
        uomField.hooks = {
          onInit: (field: FormlyFieldConfig) => {
            const parentGroup = field.parent;
            if (!parentGroup) return;

            const rowProductField = parentGroup.fieldGroup?.find(f => f.key === 'productId');
            const currentProductId = parentGroup.model?.productId;
            const currentVariantId = parentGroup.model?.productVariantId || 0;

            if (currentProductId) {
              this.purchaseService.fetchTenantRulesMatrix(this.tenantId, currentProductId, currentVariantId)
                .subscribe({
                  next: (matrix: TenantRulesMatrixResponse) => {
                    if (field.props && matrix?.availablePurchaseUnits) {
                      field.props.options = matrix.availablePurchaseUnits;
                      this.cd.detectChanges();
                    }
                  }
                });
            }

            if (rowProductField && rowProductField.formControl) {
              const sub = rowProductField.formControl.valueChanges.subscribe((productId) => {
                if (!productId) {
                  if (field.props) field.props.options = [];
                  field.formControl?.setValue(null);
                  return;
                }

                const activeVariantId = parentGroup.model?.productVariantId || 0;
                this.purchaseService.fetchTenantRulesMatrix(this.tenantId, productId, activeVariantId)
                  .subscribe({
                    next: (matrix: TenantRulesMatrixResponse) => {
                      if (field.props && matrix?.availablePurchaseUnits) {
                        field.props.options = matrix.availablePurchaseUnits;
                        const currentUomValue = field.formControl?.value;
                        if (!matrix.availablePurchaseUnits.some(u => u.value === currentUomValue)) {
                          field.formControl?.setValue(null);
                        }
                        this.cd.detectChanges();
                      }
                    }
                  });
              });
              field.hooks!.onDestroy = () => sub.unsubscribe();
            }
          }
        };
      }
    }
  }

  savePurchaseDraft() {
    this.onSaveWorkflow.emit({ model: this.model, shouldSubmit: false });
  }

  submitPurchaseForApproval() {
    this.onSaveWorkflow.emit({ model: this.model, shouldSubmit: true });
  }

  approvePO() {
    const poId = this.model.id || this.model.purchaseOrderId;
    this.onApprove.emit(poId);
  }

  sendPO() {
    const poId = this.model.id || this.model.purchaseOrderId;
    this.onSend.emit(poId);
  }
  
  convertToSalesOrder() {
          const poId = this.model.id || this.model.purchaseOrderId;
          this.onConvertToSales.emit(poId);
    }

  rejectPO() {
    const poId = this.model.id || this.model.purchaseOrderId;
    this.onReject.emit(poId);
  }

  CancelFormOp() {
    this.onCancel.emit();
  }

  clearPurchase() {
    this.model = {
      tenantId: this.tenantId,
      siteId: this.model.siteId,
      clientId: this.model.clientId,
      clientPoNumber: '',
      vendorId: null,
      vendor: null,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: null,
      status: 'DRAFT',
      notes: '',
      items: []
    };
    this.form.reset();
  }
}
