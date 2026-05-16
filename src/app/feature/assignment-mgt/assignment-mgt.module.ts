import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { AssessmentMgtRoutingModule } from './Assignment-mgt-routing.module';
import { AssessAssignmentTypeComponent } from '../../core/repeattype/assess-assignment-type/assess-assignment-type.component';
import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';



@NgModule({
  declarations: [AssessAssignmentTypeComponent],
  imports: [
    
    CommonModule,ReactiveFormsModule,

    AssessmentMgtRoutingModule, FormlyModule.forChild(),
  ],
  exports:[AssessAssignmentTypeComponent]
  
})
export class AssessmentMgtModule { }
