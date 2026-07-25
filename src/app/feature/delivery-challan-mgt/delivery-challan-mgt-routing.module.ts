import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryChallanComponent } from './delivery-challan/delivery-challan.component';
import { DeliChallanLayoutComponent } from './deli-challan-layout/deli-challan-layout.component';


const routes: Routes = 
[
    {
      path: '', 
      component: DeliChallanLayoutComponent,
          children: 
          [
            {path:'',component:DeliveryChallanComponent}
          ]
        }        
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryChallanMgtRoutingModule { }
