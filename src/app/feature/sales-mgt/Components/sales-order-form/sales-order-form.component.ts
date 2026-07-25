
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { ButtonModule } from 'primeng/button';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormlyModule, ButtonModule, NgxPermissionsModule],
  templateUrl: './sales-order-form.component.html',
  styleUrl: './sales-order-form.component.scss'
})
export class SalesOrderFormComponent {
  @Input() form!: FormGroup;
  @Input() fields: FormlyFieldConfig[] = [];
  @Input() model: any;
  @Input() totals!: { subTotal: number; taxTotal: number; grandTotal: number };
  @Input() isFormHidden: boolean = false;

  @Output() save = new EventEmitter<void>();
  @Output() onFinalize = new EventEmitter<any>();
@Output() onApprove = new EventEmitter<number>();

  @Output() clear = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
public permissionsService=inject(NgxPermissionsService)


submitToApprovalPipeline(): void {
  if (this.form.valid) {
    const payload = { ...this.model, ...this.form.value,
      clientId:this.model?.clientId || this.form.value.clientId 
    };
    this.onFinalize.emit(payload);
  }
}

executeManagerApproval(): void {
  if (this.model?.id) {
    this.onApprove.emit(this.model.id);
  }
}

}
