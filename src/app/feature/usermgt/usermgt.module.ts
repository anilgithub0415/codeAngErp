import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsermgtRoutingModule } from './usermgt-routing.module';

// NgxPermissionsModule
import { NgxPermissionsModule } from 'ngx-permissions'; 


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UsermgtRoutingModule,
    // NgxPermissionsModule - configure forRoot
NgxPermissionsModule.forRoot(), // <-- Add this here
  ]
})
export class UsermgtModule { }
