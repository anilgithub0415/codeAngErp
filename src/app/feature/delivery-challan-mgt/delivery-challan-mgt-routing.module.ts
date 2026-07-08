import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryChallanComponent } from './delivery-challan/delivery-challan.component';

const routes: Routes = [
  {path:'',component:DeliveryChallanComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryChallanMgtRoutingModule { }
