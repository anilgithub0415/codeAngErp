import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductmgtRoutingModule } from './productmgt-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule, FormsModule,  FormlyModule.forRoot(), 
    FormlyPrimeNGModule,
    ProductmgtRoutingModule
  ]
})
export class ProductmgtModule { }
