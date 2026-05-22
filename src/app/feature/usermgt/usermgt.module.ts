import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsermgtRoutingModule } from './usermgt-routing.module';

// NgxPermissionsModule
import { NgxPermissionsModule } from 'ngx-permissions'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule, FormsModule,  FormlyModule.forRoot(), 
    FormlyPrimeNGModule,
    UsermgtRoutingModule,
    // NgxPermissionsModule - configure forRoot
    BrowserAnimationsModule,FormlyPrimeNGModule,
NgxPermissionsModule.forRoot(), // <-- Add this here
  ]
})
export class UsermgtModule { }
