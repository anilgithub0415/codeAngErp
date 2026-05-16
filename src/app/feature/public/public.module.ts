import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';

// NgxPermissionsModule
import { NgxPermissionsModule } from 'ngx-permissions'; 

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PublicRoutingModule,
    // NgxPermissionsModule - configure forRoot
NgxPermissionsModule.forRoot(), // <-- Add this here
  ]
})
export class PublicModule { }
