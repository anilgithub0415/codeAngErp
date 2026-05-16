import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [],
  imports: [
    AuthRoutingModule
  ]
  ,schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AuthModule { }
