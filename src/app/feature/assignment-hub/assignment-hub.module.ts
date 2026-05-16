import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignmentHubRoutingModule } from './assignment-hub-routing.module';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AssignmentHubRoutingModule,FormlyPrimeNGModule
  ]
})
export class AssignmentHubModule { }
