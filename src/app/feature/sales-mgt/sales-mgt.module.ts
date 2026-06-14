import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesMgtRoutingModule } from './sales-mgt-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule, FormsModule,  FormlyModule,
    FormlyPrimeNGModule,
    DataViewModule,ButtonModule,TagModule, TableModule, InputNumberModule, InputTextModule, ToastModule,
    SalesMgtRoutingModule
  ]
})
export class SalesMgtModule { }
