import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentComponent } from './assignment/assignment.component';
import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { AssessmentComponent } from './assessment/assessment.component';

const routes: Routes = [
  {path:'',component:AssignmentComponent
  ,children:[
    {
      path:'',component:AssignmentListComponent
    },
    {
      path:'assess',component:AssessmentComponent
    }
  ]
 }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentMgtRoutingModule { }
