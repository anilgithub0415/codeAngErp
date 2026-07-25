



import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';    import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { RepeatsectiontypeComponent } from './repeatsectiontype/repeatsectiontype.component';
import { ButtonModule } from 'primeng/button';

import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';

import { QuestiontextComponent } from './questiontext/questiontext.component';





@NgModule({
  declarations: [QuestiontextComponent],
  
  //schemas:[NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,FormsModule,InputTextModule,
    ReactiveFormsModule, ButtonModule, DropdownModule,
    //FormlyModule.forRoot(), 
    FormlyPrimeNGModule,

    TableModule,CheckboxModule,DialogModule,SelectModule
  ],
  exports:[QuestiontextComponent]
})
export class RepeattypeModule { }
