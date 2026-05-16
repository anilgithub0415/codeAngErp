import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentdashboardComponent } from './assignmentdashboard/assignmentdashboard.component';
import { AssignmenttakeComponent } from './assignmenttake/assignmenttake.component';
import { ReviewResultComponent } from './review-result/review-result.component';

const routes: Routes = [
  {path:'',component:AssignmentdashboardComponent},
  {path:'takeAssignment',component:AssignmenttakeComponent, canDeactivate: [false]},
  {path:'reviewresult',component:ReviewResultComponent},
  //
  // children: [
  //   // Your other sibling routes would go here
  //   {path:'reviewresult',component:ReviewResultComponent},
  //   { path: 'takeAssignment', component: AssignmenttakeComponent }
  // ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignmentHubRoutingModule { }
