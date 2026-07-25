import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserMgrComponent } from './user-mgr/user-mgr.component';


const routes: Routes = [
  {path:'',component:UserMgrComponent},
 ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsermgtRoutingModule { }
