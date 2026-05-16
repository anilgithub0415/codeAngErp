import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PersonlistComponent } from './personlist/personlist.component';
import { FacultyProfileComponent } from './faculty-profile/faculty-profile.component';

const routes: Routes = [
  {path:'',component:PersonlistComponent},
  {path:'facultyprofile',component:FacultyProfileComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeopleRoutingModule { }
