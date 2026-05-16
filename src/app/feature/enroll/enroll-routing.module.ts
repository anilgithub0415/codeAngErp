import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnrollComponent } from './enroll/enroll.component';
import { EnrollmentComponent } from './enrollment/enrollment.component';

const routes: Routes = [
  {path:'',component:EnrollmentComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnrollRoutingModule { }
