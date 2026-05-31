import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductmgtRoutingModule } from './productmgt-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProductMasterComponent } from './product-master/product-master.component';
import { PrimeNG } from 'primeng/config';


@NgModule({
  declarations: [ProductMasterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule, FormsModule,  FormlyModule.forRoot(), 
    FormlyPrimeNGModule,
    DataViewModule,ButtonModule,TagModule, 
    ProductmgtRoutingModule
  ]
})
export class ProductmgtModule { }
