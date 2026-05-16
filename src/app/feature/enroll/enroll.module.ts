import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnrollRoutingModule } from './enroll-routing.module';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { FormlyModule } from '@ngx-formly/core';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EnrollRoutingModule,FormlySelectModule,FormlyModule
  ]
})
export class EnrollModule { }
