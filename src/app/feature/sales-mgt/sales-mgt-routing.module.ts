import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesorderComponent } from './salesorder/salesorder.component';

const routes: Routes = [
  {path:'', component:SalesorderComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesMgtRoutingModule { }
