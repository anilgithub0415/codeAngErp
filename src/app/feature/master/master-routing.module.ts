import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorComponent } from './vendor/vendor.component';
import { CityComponent } from './city/city/city.component';
import { DistrictComponent } from './district/district/district.component';
import { LeadsourceComponent } from './leadsource/leadsource.component';
import { MasterLayoutComponent } from './master-layout/master-layout.component';



const routes: Routes = 
[
    {
      path: '', 
      component: MasterLayoutComponent,
          children: 
          [
              {path:'',component:VendorComponent},
              {path:'city',component:CityComponent},
              {path:'district',component:DistrictComponent},
              {path:'leadsource',component:LeadsourceComponent}
          ]
    }          
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
