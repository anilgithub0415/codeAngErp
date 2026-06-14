import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyFieldButtonComponent } from '../components/formlyfields/formly-field-button/formly-field-button.component';
import { ButtonModule } from 'primeng/button';



@NgModule({
  declarations: [FormlyFieldButtonComponent],
  imports: [
    CommonModule,ButtonModule
  ],
  exports:[FormlyFieldButtonComponent,ButtonModule]
})
export class SharedModule { }
